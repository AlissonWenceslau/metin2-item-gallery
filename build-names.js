/**
 * build-names.js
 * 
 * Lê o arquivo SQL do item_proto, extrai pares (vnum, locale_name),
 * decodifica o hex para string e gera o arquivo itemNames.js.
 * 
 * Uso: node build-names.js
 */

const fs = require('fs');
const path = require('path');

const SQL_FILE = path.join(__dirname, 'item_proto_202609120815.sql');
const IMAGE_LIST_FILE = path.join(__dirname, 'imageList.js');
const OUTPUT_FILE = path.join(__dirname, 'itemNames.js');

// ── 1. Carregar e parsear imageList.js para obter os vnums disponíveis ──────
const imageListContent = fs.readFileSync(IMAGE_LIST_FILE, 'utf-8');
const imagesMatch = imageListContent.match(/const images\s*=\s*\[([^\]]+)\]/s);
if (!imagesMatch) {
    console.error('❌ Não foi possível encontrar o array "images" em imageList.js');
    process.exit(1);
}

const imageFilenames = imagesMatch[1].match(/"([^"]+)"/g).map(s => s.replace(/"/g, ''));

// Extrair vnums a partir dos nomes dos arquivos (remove extensão, converte para int)
const availableVnums = new Set();
for (const filename of imageFilenames) {
    const base = path.basename(filename, path.extname(filename));
    const num = parseInt(base, 10);
    if (!isNaN(num)) {
        availableVnums.add(num);
    }
}

console.log(`✅ ${availableVnums.size} vnums encontrados em imageList.js`);

// ── 2. Função para decodificar hex → string ───────────────────────────────
function hexToString(hex) {
    // hex pode ser: 0x476F6C64 ou 476F6C64
    const clean = hex.replace(/^0x/i, '');
    let result = '';
    for (let i = 0; i < clean.length; i += 2) {
        const byte = parseInt(clean.substring(i, i + 2), 16);
        if (!isNaN(byte)) {
            result += String.fromCharCode(byte);
        }
    }
    return result;
}

// ── 3. Ler e parsear o SQL ────────────────────────────────────────────────
console.log('📖 Lendo arquivo SQL...');
const sqlContent = fs.readFileSync(SQL_FILE, 'utf-8');

// Regex para capturar cada linha de VALUES: (vnum, name_hex, locale_name_hex, ...)
// Formato: (vnum, 0xHEX_name, 0xHEX_locale_name, ...)
const rowRegex = /\(\s*(\d+)\s*,\s*(0x[0-9A-Fa-f]+|'[^']*')\s*,\s*(0x[0-9A-Fa-f]+|'[^']*')\s*,/g;

const itemNames = {};
let totalFound = 0;
let totalMapped = 0;
let match;

while ((match = rowRegex.exec(sqlContent)) !== null) {
    const vnum = parseInt(match[1], 10);
    const localeNameRaw = match[3]; // terceira coluna = locale_name

    totalFound++;

    // Decodificar locale_name
    let name = '';
    if (localeNameRaw.startsWith('0x') || localeNameRaw.startsWith('0X')) {
        name = hexToString(localeNameRaw);
    } else if (localeNameRaw.startsWith("'")) {
        // Já é string literal
        name = localeNameRaw.slice(1, -1);
    }

    // Limpar possíveis caracteres de controle e espaços extras
    name = name.trim();

    // Apenas registrar se o vnum existe na galeria
    if (availableVnums.has(vnum) && name.length > 0) {
        itemNames[vnum] = name;
        totalMapped++;
    }
}

console.log(`✅ ${totalFound} itens encontrados no SQL`);
console.log(`✅ ${totalMapped} itens mapeados (presentes na galeria)`);
console.log(`⚠️  ${availableVnums.size - totalMapped} itens da galeria sem nome no SQL`);

// ── 4. Gerar itemNames.js ─────────────────────────────────────────────────
const entries = Object.entries(itemNames)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .map(([vnum, name]) => `  ${vnum}: ${JSON.stringify(name)}`)
    .join(',\n');

const output = `// itemNames.js — Gerado automaticamente por build-names.js
// Mapeamento vnum → nome do item (decodificado do item_proto SQL)
// Gerado em: ${new Date().toLocaleString('pt-BR')}
// Total de itens mapeados: ${totalMapped}

const itemNames = {
${entries}
};
`;

fs.writeFileSync(OUTPUT_FILE, output, 'utf-8');
console.log(`\n🎉 itemNames.js gerado com sucesso em: ${OUTPUT_FILE}`);
