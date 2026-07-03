// importeur/index.js

export async function importJSON5 (path) {
  const JSON5    = (await import('https://unpkg.com/json5@2/dist/index.min.mjs')).default;
  const response = await fetch(path);
  const text     = await response.text();
  return JSON5.parse(text);
}

export async function importJSONC (path) {
  const response = await fetch(path);
  const text     = await response.text();
  const json     = text.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? "" : m);
  return JSON.parse(json);
}

export async function importSCSS (path) {
  const SASS     = (await import('https://esm.sh/sass@1.70.0')).default;
  const response = await fetch(path);
  const text     = await response.text();
  const css      = SASS.compileString(text).css;
  const sheet    = new CSSStyleSheet();
  sheet.replaceSync(css);
  return sheet;
}

export async function importTOML (path) {
  const { parse } = await import('https://esm.sh/smol-toml@1.1.4');
  const response = await fetch(path);
  const text = await response.text();
  return parse(text);
}

export async function importYAML (path) {
  const YAML = (await import('https://esm.sh/yaml@2.3.4')).default;
  const response = await fetch(path);
  const text = await response.text();
  return YAML.parse(text);
}

// :::::: MAIN METHOD

const extensionMap = {
  json5 : importJSON5,
  jsonc : importJSONC,
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
