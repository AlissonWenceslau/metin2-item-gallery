/**
 * build-names.js
 *
 * Lê o arquivo SQL do item_proto, extrai pares (vnum, locale_name, type),
 * decodifica o hex para string e gera dois arquivos:
 *   - itemNames.js  → vnum → nome do item
 *   - itemTypes.js  → vnum → type (categoria)
 *
 * Uso: node build-names.js
 */

const fs   = require('fs');
const path = require('path');

const SQL_FILE        = path.join(__dirname, 'item_proto_202609120815.sql');
const IMAGE_LIST_FILE = path.join(__dirname, 'imageList.js');
const OUT_NAMES       = path.join(__dirname, 'itemNames.js');
const OUT_TYPES       = path.join(__dirname, 'itemTypes.js');

// ── 1. Carregar imageList.js para obter os vnums disponíveis ────────────────
const imageListContent = fs.readFileSync(IMAGE_LIST_FILE, 'utf-8');
const imagesMatch = imageListContent.match(/const images\s*=\s*\[([^\]]+)\]/s);
if (!imagesMatch) {
    console.error('❌ Não foi possível encontrar o array "images" em imageList.js');
    process.exit(1);
}

const imageFilenames = imagesMatch[1].match(/"([^"]+)"/g).map(s => s.replace(/"/g, ''));

const availableVnums = new Set();
for (const filename of imageFilenames) {
    const base = path.basename(filename, path.extname(filename));
    const num  = parseInt(base, 10);
    if (!isNaN(num)) availableVnums.add(num);
}

console.log(`✅ ${availableVnums.size} vnums encontrados em imageList.js`);

// ── 2. Decodificar hex → string ─────────────────────────────────────────────
function hexToString(hex) {
    const clean = hex.replace(/^0x/i, '');
    let result = '';
    for (let i = 0; i < clean.length; i += 2) {
        const byte = parseInt(clean.substring(i, i + 2), 16);
        if (!isNaN(byte)) result += String.fromCharCode(byte);
    }
    return result;
}

// ── 3. Ler e parsear o SQL ───────────────────────────────────────────────────
// Colunas: (vnum, name, locale_name, type, subtype, ...)
// Regex captura: vnum (col1), locale_name (col3), type (col4)
console.log('📖 Lendo arquivo SQL...');
const sqlContent = fs.readFileSync(SQL_FILE, 'utf-8');

const rowRegex = /\(\s*(\d+)\s*,\s*(0x[0-9A-Fa-f]+|'[^']*')\s*,\s*(0x[0-9A-Fa-f]+|'[^']*')\s*,\s*(\d+)\s*,/g;

const itemNames = {};
const itemTypes = {};
let totalFound  = 0;
let totalMapped = 0;
let match;

while ((match = rowRegex.exec(sqlContent)) !== null) {
    const vnum          = parseInt(match[1], 10);
    const localeNameRaw = match[3]; // coluna locale_name
    const itemType      = parseInt(match[4], 10); // coluna type

    totalFound++;

    // Decodificar locale_name
    let name = '';
    if (/^0x/i.test(localeNameRaw)) {
        name = hexToString(localeNameRaw);
    } else if (localeNameRaw.startsWith("'")) {
        name = localeNameRaw.slice(1, -1);
    }
    name = name.trim();

    if (availableVnums.has(vnum)) {
        if (name.length > 0) itemNames[vnum] = name;
        itemTypes[vnum] = itemType;
        totalMapped++;
    }
}

console.log(`✅ ${totalFound} itens encontrados no SQL`);
console.log(`✅ ${totalMapped} itens mapeados na galeria`);
console.log(`   └─ ${Object.keys(itemNames).length} com nome  |  ${Object.keys(itemTypes).length} com tipo`);

// ── 4. Gerar itemNames.js ────────────────────────────────────────────────────
const now = new Date().toLocaleString('pt-BR');

const namesEntries = Object.entries(itemNames)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map(([vnum, name]) => `  ${vnum}: ${JSON.stringify(name)}`)
    .join(',\n');

fs.writeFileSync(OUT_NAMES,
`// itemNames.js — Gerado automaticamente por build-names.js
// Mapeamento vnum -> nome do item (decodificado do item_proto SQL)
// Gerado em: ${now}
// Total de itens com nome: ${Object.keys(itemNames).length}

const itemNames = {
${namesEntries}
};
`, 'utf-8');

console.log(`\n✅ itemNames.js gerado → ${OUT_NAMES}`);

// ── 5. Gerar itemTypes.js ────────────────────────────────────────────────────
const typesEntries = Object.entries(itemTypes)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map(([vnum, type]) => `  ${vnum}: ${type}`)
    .join(',\n');

fs.writeFileSync(OUT_TYPES,
`// itemTypes.js — Gerado automaticamente por build-names.js
// Mapeamento vnum -> type (categoria do item no engine Metin2)
// Gerado em: ${now}
// Total de itens com tipo: ${Object.keys(itemTypes).length}

const itemTypes = {
${typesEntries}
};
`, 'utf-8');

console.log(`✅ itemTypes.js gerado → ${OUT_TYPES}`);
console.log('\n🎉 Build concluído!');
