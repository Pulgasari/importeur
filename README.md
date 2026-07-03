# importeur

Import several file-extensions directly in the web/browser environment.

- used libraries/compilers are imported dynamically (only loaded if used at all)
- fully tree-shakable

## Supported Extensions

### all

ext    | library   | modes | default mode
-------|-----------|-------|-------------
.csv   | papaparse |       | js-object
.json5 | json5     |       | js-object
.jsonc |           |       | js-object
.jsx   | sucrase   |       | js-module
.less  | less      |       | css-stylesheet
.md    | marked    |       | html-string
.sass  | sass      |       | css-stylesheet
.scss  | scss      |       | css-stylesheet
.toml  | smol-toml |       | js-object
.ts    | sucrase   |       | js-module
.tsv   | papaparse |       | js-object
.tsx   | sucrase   |       | js-module
.wasm  |           |       | 
.xml   | DOMParser / fast-xml-parser | | js-object
.yaml  | yaml      |       | js-object

### data

ext    | library   | modes | default mode
-------|-----------|-------|-------------
.csv   | papaparse |       | js-object
.json5 | json5     |       | js-object
.jsonc |           |       | js-object
.toml  | smol-toml |       | js-object
.xml   | DOMParser / fast-xml-parser | | js-object
.yaml  | yaml      |       | js-object

### dialects of css

ext    | library   | modes | default mode
-------|-----------|-------|-------------
.less  | less      |       | css-stylesheet
.sass  | sass      |       | css-stylesheet
.scss  | scss      |       | css-stylesheet

### dialects of js

ext    | library   | modes | default mode
-------|-----------|-------|-------------
.jsx   | sucrase   |       | js-module
.ts    | sucrase   |       | js-module
.tsx   | sucrase   |       | js-module
  
