// importeur/index.js

// :::::: HELPERS

async function fetchText (path) {
  const response = await fetch(path);
  if (!response.ok) throw new Error(`[importeur] Error while loading "${path}": ${response.status} ${response.statusText}`);
  return response.text();
}

function transformCSSResult (cssCode, asOption) {
  if (asOption === 'css') return cssCode;
  if (asOption === 'style') {
    const element = document.createElement('style');
    element.textContent = cssCode;
    return element;
  }
  // Default: 'sheet' (CSSStyleSheet)
  const sheet = new CSSStyleSheet();
  sheet.replaceSync(cssCode);
  return sheet;
}

// :::::: IMPORT METHODS

export async function importCSV (path, options = {}) {
  const text = await fetchText(path);
  if (options.as === 'raw') return text;

  const PAPA = (await import('https://esm.sh/papaparse@5.4.1')).default;
  const ext  = path.split('.').pop().toLowerCase();

  const config = {
    header        : options.as !== 'array', // Default: true (gibt Objekte zurück), bei 'array' false
    delimiter     : ext === 'tsv' ? '\t' : undefined, // auto TSV detection
    dynamicTyping : true, // Konvertiert Zahlen/Booleans automatisch aus dem String
    ...options.csvOptions
  };

  const result = PAPA.parse(text, config);
  return result.data;
}

export async function importJSON5 (path, options = {}) {
  const text = await fetchText(path);
  if (options.as === 'raw') return text;
  
  const JSON5    = (await import('https://unpkg.com/json5@2/dist/index.min.mjs')).default;
  return JSON5.parse(text);
}

export async function importJSONC (path, options = {}) {
  const text = await fetchText(path);
  if (options.as === 'raw') return text;
  
  const json = text.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m);
  return JSON.parse(json);
}

export async function importLESS (path, options = {}) {
  const text = await fetchText(path);
  if (options.as === 'raw') return text;

  const LESS   = (await import('https://esm.sh/less@4.2.0')).default;
  const output = await LESS.render(text);
  
  return transformCSSResult(output.css, options.as);
}

export async function importMD (path, options = {}) {
  const text = await fetchText(path);
  if (options.as === 'raw') return text;

  let html;
  if (options.compiler) { // custom compiler
    html = options.compiler(text);
  } else {
    const { marked } = await import('https://esm.sh/marked@11.1.1');
    html = await marked.parse(text);
  }

  if (options.as === 'element') {
    const div = document.createElement('div');
    div.innerHTML = html;
    return div;
  }

  return html; // default: 'html' (String)
}


export async function importSASS (path, options = {}) {
  const text = await fetchText(path);
  if (options.as === 'raw') return text;

  const SASS = (await import('https://esm.sh/sass@1.70.0')).default;
  const css  = SASS.compileString(text, { syntax: 'indented' }).css;

  return transformCSSResult(css, options.as);
}

export async function importSCSS (path, options = {}) {
  const text = await fetchText(path);
  if (options.as === 'raw') return text;

  const SASS = (await import('https://esm.sh/sass@1.70.0')).default;
  const css  = SASS.compileString(text, { syntax: 'scss' }).css;

  return transformCSSResult(css, options.as);
}


export async function importTOML (path, options = {}) {
  const text = await fetchText(path);
  if (options.as === 'raw') return text;
  
  const { parse } = await import('https://esm.sh/smol-toml@1.1.4');
  return parse(text);
}

export async function importWASM (path, options = {}) {
  const response = await fetch(path); // needs binary data not text
  if (!response.ok) throw new Error(`[importeur] Error while loading WASM "${path}": ${response.status}`);
  
  if (options.as === 'buffer') return response.arrayBuffer();
  if (options.as === 'module') return WebAssembly.compileStreaming(response);
  // default: 'instance' (Gibt direkt die ausführbaren JS-Exports zurück)
  // options.importObject kann übergeben werden, falls das WASM-Modul Imports vom Host benötigt
  const { instance } = await WebAssembly.instantiateStreaming(response, options.importObject || {});
  return instance.exports;
}

export async function importXML (path, options = {}) {
  const text = await fetchText(path);
  if (options.as === 'raw') return text;

  if (options.as === 'document') {
    const parser = new DOMParser();
    return parser.parseFromString(text, 'text/xml');
  }

  const { XMLParser } = await import('https://esm.sh/fast-xml-parser@4.3.2');
  const xmlParser     = new XMLParser(options.xmlOptions || {});
  const jsObj         = xmlParser.parse(text);

  if (options.as === 'json') return JSON.stringify(jsObj);

  return jsObj; // default: js-object
}

export async function importYAML (path, options = {}) {
  const text = await fetchText(path);
  if (options.as === 'raw') return text;
  
  const YAML = (await import('https://esm.sh/yaml@2.3.4')).default;
  return YAML.parse(text);
}

// :::::: MAIN METHOD

const extensionMap = {
  csv   : importCSV,
  json5 : importJSON5,
  jsonc : importJSONC,
  less  : importLESS,
  md    : importMD,
  sass  : importSASS,
  scss  : importSCSS,
  toml  : importTOML,
  tsv   : importCSV,
  wasm  : importWASM,
  xml   : importXML,
  yaml  : importYAML,
  yml   : importYAML, // Alias für .yml
};

export async function importeur (path) {
  const ext     = path.split('.').pop().toLowerCase();
  const handler = extensionMap[ext];
  if (!handler) throw new Error(`[importeur] The fileExtension .${ext} is not supported.`);
  //
  return handler(path);
};

export default importeur;
