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

export async function importYAML (path, options = {}) {
  const text = await fetchText(path);
  if (options.as === 'raw') return text;
  
  const YAML = (await import('https://esm.sh/yaml@2.3.4')).default;
  return YAML.parse(text);
}

// :::::: MAIN METHOD

const extensionMap = {
  json5 : importJSON5,
  jsonc : importJSONC,
  less  : importLESS,
  sass  : importSASS,
  scss  : importSCSS,
  toml  : importTOML,
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
