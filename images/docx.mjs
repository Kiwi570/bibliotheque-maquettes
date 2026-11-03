// Document Word (.docx) minimal, sans dépendance : titres, paragraphes, puces, encadrés colorés, tableau.
// blocs : [{ t: 'titre'|'sous-titre'|'h1'|'h2'|'p'|'puce'|'encadre'|'tableau', texte, gras, lignes: [[...]] }]
import fs from 'node:fs';
import zlib from 'node:zlib';

const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const run = (texte, { gras = false, taille, couleur } = {}) => `<w:r><w:rPr>${gras ? '<w:b/>' : ''}${taille ? `<w:sz w:val="${taille}"/>` : ''}${couleur ? `<w:color w:val="${couleur}"/>` : ''}</w:rPr><w:t xml:space="preserve">${esc(texte)}</w:t></w:r>`;
// « **gras** » dans un texte de paragraphe.
const runs = (texte, o = {}) => String(texte).split(/(\*\*[^*]+\*\*)/).filter(Boolean).map(x => x.startsWith('**') ? run(x.slice(2, -2), { ...o, gras: true }) : run(x, o)).join('');
const para = (contenu, { style, fond, espaceApres = 120, retrait } = {}) =>
  `<w:p><w:pPr>${style ? `<w:pStyle w:val="${style}"/>` : ''}${fond ? `<w:shd w:val="clear" w:color="auto" w:fill="${fond}"/><w:pBdr><w:left w:val="single" w:sz="18" w:space="8" w:color="C9A96E"/></w:pBdr>` : ''}<w:spacing w:after="${espaceApres}"/>${retrait ? `<w:ind w:left="${retrait}" w:hanging="240"/>` : ''}</w:pPr>${contenu}</w:p>`;

function corps(blocs) {
  return blocs.map(b => {
    switch (b.t) {
      case 'titre': return para(run(b.texte, { gras: true, taille: 40 }), { style: 'Title', espaceApres: 80 });
      case 'sous-titre': return para(run(b.texte, { taille: 22, couleur: '666666' }), { espaceApres: 280 });
      case 'h1': return para(run(b.texte), { style: 'Heading1' });
      case 'h2': return para(run(b.texte), { style: 'Heading2' });
      case 'puce': return para(run('•\t') + runs(b.texte), { retrait: 360, espaceApres: 60 });
      case 'encadre': return para(runs(b.texte, { taille: 20 }), { fond: 'F5EEDC', espaceApres: 240 });
      case 'tableau': {
        const cell = (x, entete) => `<w:tc><w:tcPr><w:tcBorders><w:bottom w:val="single" w:sz="4" w:color="DDDDDD"/></w:tcBorders>${entete ? '<w:shd w:val="clear" w:color="auto" w:fill="EFEAE0"/>' : ''}</w:tcPr><w:p><w:pPr><w:spacing w:after="40"/></w:pPr>${run(x, { gras: entete, taille: 18 })}</w:p></w:tc>`;
        return `<w:tbl><w:tblPr><w:tblW w:w="5000" w:type="pct"/><w:tblCellMar><w:left w:w="80" w:type="dxa"/><w:right w:w="80" w:type="dxa"/></w:tblCellMar></w:tblPr>${b.lignes.map((l, i) => `<w:tr>${l.map(x => cell(x, i === 0)).join('')}</w:tr>`).join('')}</w:tbl>${para('', { espaceApres: 200 })}`;
      }
      default: return para(runs(b.texte), {});
    }
  }).join('\n');
}

const STYLES = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
<w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri" w:cs="Calibri"/><w:sz w:val="22"/><w:lang w:val="fr-FR"/></w:rPr></w:rPrDefault></w:docDefaults>
<w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/></w:style>
<w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:rPr><w:sz w:val="40"/><w:b/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="360" w:after="120"/><w:outlineLvl w:val="0"/></w:pPr><w:rPr><w:b/><w:sz w:val="30"/><w:color w:val="2F3B2F"/></w:rPr></w:style>
<w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:pPr><w:keepNext/><w:spacing w:before="240" w:after="60"/><w:outlineLvl w:val="1"/></w:pPr><w:rPr><w:b/><w:sz w:val="24"/></w:rPr></w:style>
</w:styles>`;

// Archive zip (méthode deflate) écrite à la main.
function zip(fichiers) {
  const locaux = [], centraux = [];
  let decalage = 0;
  for (const [nom, contenu] of fichiers) {
    const brut = Buffer.from(contenu), comp = zlib.deflateRawSync(brut), n = Buffer.from(nom), crc = zlib.crc32(brut);
    const l = Buffer.alloc(30); l.writeUInt32LE(0x04034b50, 0); l.writeUInt16LE(20, 4); l.writeUInt16LE(0x0800, 6); l.writeUInt16LE(8, 8);
    l.writeUInt32LE(0, 10); l.writeUInt32LE(crc, 14); l.writeUInt32LE(comp.length, 18); l.writeUInt32LE(brut.length, 22); l.writeUInt16LE(n.length, 26); l.writeUInt16LE(0, 28);
    const c = Buffer.alloc(46); c.writeUInt32LE(0x02014b50, 0); c.writeUInt16LE(20, 4); c.writeUInt16LE(20, 6); c.writeUInt16LE(0x0800, 8); c.writeUInt16LE(8, 10);
    c.writeUInt32LE(0, 12); c.writeUInt32LE(crc, 16); c.writeUInt32LE(comp.length, 20); c.writeUInt32LE(brut.length, 24); c.writeUInt16LE(n.length, 28); c.writeUInt32LE(decalage, 42);
    locaux.push(l, n, comp); centraux.push(c, n);
    decalage += 30 + n.length + comp.length;
  }
  const tc = Buffer.concat(centraux), fin = Buffer.alloc(22);
  fin.writeUInt32LE(0x06054b50, 0); fin.writeUInt16LE(fichiers.length, 8); fin.writeUInt16LE(fichiers.length, 10); fin.writeUInt32LE(tc.length, 12); fin.writeUInt32LE(decalage, 16);
  return Buffer.concat([...locaux, tc, fin]);
}

export function ecrireDocx(fichier, titre, blocs) {
  const doc = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body>${corps(blocs)}
<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr></w:body></w:document>`;
  fs.writeFileSync(fichier, zip([
    ['[Content_Types].xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/><Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/></Types>`],
    ['_rels/.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/></Relationships>`],
    ['word/_rels/document.xml.rels', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>`],
    ['docProps/core.xml', `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>${esc(titre)}</dc:title><dc:language>fr-FR</dc:language><dcterms:created xsi:type="dcterms:W3CDTF">${new Date().toISOString().slice(0, 19)}Z</dcterms:created></cp:coreProperties>`],
    ['word/styles.xml', STYLES],
    ['word/document.xml', doc],
  ]));
}
