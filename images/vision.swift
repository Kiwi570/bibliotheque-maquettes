// Détection locale avec le framework Vision de macOS (fourni par le système, aucun modèle à télécharger, sans GPU requis).
// Usage : vision <image>... → une ligne JSON par image : visages, corps, mains, objets saillants, texte lu.
// Coordonnées en pourcentage de l'image, origine en haut à gauche.
import Foundation
import Vision
import ImageIO

func boite(_ r: CGRect) -> [String: Double] {
  let f = { (v: CGFloat) in (Double(v) * 1000).rounded() / 10 }
  return ["x": f(r.minX), "y": f(1 - r.maxY), "l": f(r.width), "h": f(r.height)]
}

for chemin in CommandLine.arguments.dropFirst() {
  var sortie: [String: Any] = ["fichier": chemin]
  let url = URL(fileURLWithPath: chemin)
  guard let src = CGImageSourceCreateWithURL(url as CFURL, nil),
        let img = CGImageSourceCreateImageAtIndex(src, 0, [kCGImageSourceShouldCache: false] as CFDictionary) else {
    sortie["erreur"] = "illisible"
    print(String(data: try! JSONSerialization.data(withJSONObject: sortie), encoding: .utf8)!)
    continue
  }
  let visages = VNDetectFaceRectanglesRequest()
  let corps = VNDetectHumanRectanglesRequest()
  corps.upperBodyOnly = false
  let saillance = VNGenerateAttentionBasedSaliencyImageRequest()
  let objets = VNGenerateObjectnessBasedSaliencyImageRequest()
  let mains = VNDetectHumanHandPoseRequest()
  mains.maximumHandCount = 8
  let texte = VNRecognizeTextRequest()
  texte.recognitionLevel = .accurate
  texte.recognitionLanguages = ["fr-FR", "en-US", "de-DE"]
  texte.usesLanguageCorrection = true
  texte.minimumTextHeight = 0.02
  let h = VNImageRequestHandler(cgImage: img, options: [:])
  do { try h.perform([visages, corps, saillance, objets, texte, mains]) } catch { sortie["erreur"] = "\(error)" }
  sortie["visages"] = (visages.results ?? []).map { o -> [String: Any] in
    var b: [String: Any] = boite(o.boundingBox); b["confiance"] = Double(o.confidence); return b }
  sortie["corps"] = (corps.results ?? []).filter { $0.confidence > 0.5 }.map { o -> [String: Any] in
    var b: [String: Any] = boite(o.boundingBox); b["confiance"] = Double(o.confidence); return b }
  sortie["saillance"] = ((saillance.results?.first)?.salientObjects ?? []).map { o -> [String: Any] in
    var b: [String: Any] = boite(o.boundingBox); b["confiance"] = Double(o.confidence); return b }
  // Mains : boîte des articulations et nombre de bouts de doigts reconnus (indicatif : un sixième doigt ne se voit pas ici).
  sortie["mains"] = (mains.results ?? []).compactMap { o -> [String: Any]? in
    guard let pts = try? o.recognizedPoints(.all) else { return nil }
    let surs = pts.values.filter { $0.confidence > 0.3 }
    guard surs.count >= 6 else { return nil }
    let xs = surs.map { $0.location.x }, ys = surs.map { $0.location.y }
    let r = CGRect(x: xs.min()!, y: ys.min()!, width: xs.max()! - xs.min()!, height: ys.max()! - ys.min()!)
    let bouts: [VNHumanHandPoseObservation.JointName] = [.thumbTip, .indexTip, .middleTip, .ringTip, .littleTip]
    var b: [String: Any] = boite(r)
    b["doigts"] = bouts.filter { (pts[$0]?.confidence ?? 0) > 0.3 }.count
    b["confiance"] = Double(o.confidence)
    return b }
  sortie["objets"] = ((objets.results?.first)?.salientObjects ?? []).map { o -> [String: Any] in
    var b: [String: Any] = boite(o.boundingBox); b["confiance"] = Double(o.confidence); return b }
  // Carte d'attention (environ 68×68) : barycentre et boîte des points au-dessus de la moitié du maximum.
  if let carte = (saillance.results?.first)?.pixelBuffer {
    CVPixelBufferLockBaseAddress(carte, .readOnly)
    let w = CVPixelBufferGetWidth(carte), hh = CVPixelBufferGetHeight(carte), pas = CVPixelBufferGetBytesPerRow(carte) / 4
    let p = CVPixelBufferGetBaseAddress(carte)!.assumingMemoryBound(to: Float32.self)
    var mx: Float32 = 0
    for y in 0..<hh { for x in 0..<w { mx = max(mx, p[y * pas + x]) } }
    var sx = 0.0, sy = 0.0, st = 0.0, x0 = w, y0 = hh, x1 = 0, y1 = 0
    for y in 0..<hh { for x in 0..<w {
      let v = p[y * pas + x]
      if mx > 0 && v >= mx * 0.5 {
        let d = Double(v); sx += d * (Double(x) + 0.5); sy += d * (Double(y) + 0.5); st += d
        x0 = min(x0, x); y0 = min(y0, y); x1 = max(x1, x); y1 = max(y1, y)
      }
    } }
    CVPixelBufferUnlockBaseAddress(carte, .readOnly)
    if st > 0 {
      let r = { (v: Double) in (v * 1000).rounded() / 10 }
      sortie["attention"] = ["cx": r(sx / st / Double(w)), "cy": r(sy / st / Double(hh)),
        "x": r(Double(x0) / Double(w)), "y": r(Double(y0) / Double(hh)), "l": r(Double(x1 - x0 + 1) / Double(w)), "h": r(Double(y1 - y0 + 1) / Double(hh))]
    }
  }
  sortie["texte"] = (texte.results ?? []).compactMap { o -> [String: Any]? in
    guard let c = o.topCandidates(1).first, c.confidence >= 0.4 else { return nil }
    var b: [String: Any] = boite(o.boundingBox); b["texte"] = c.string; b["confiance"] = Double(c.confidence); return b }
  print(String(data: try! JSONSerialization.data(withJSONObject: sortie), encoding: .utf8)!)
}
