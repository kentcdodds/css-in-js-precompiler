import path from 'path'
import cssParser from 'css'

export {formatOutput, fixturePath, formatCSS, relativizePaths, trimAndNewline}

function formatOutput({sourceCode, code, css}) {
  return trimAndNewline(
    [
      '\n',
      sourceCode.trim(),
      `\n\n    👇\n\n`,
      code.trim(),
      '\n\n',
      formatCSS(css),
      '\n',
    ].join(''),
  )
}

function fixturePath(name) {
  return path.join(__dirname, '..', '__fixtures__', name)
}

function formatCSS(css) {
  return cssParser.stringify(cssParser.parse(css)).trim()
}

/*
 * This takes the results object and removes environment-specific
 * elements from the path.
 */
function relativizePaths(filepath) {
  return filepath
    .replace(':/', ':\\')
    .replace(path.resolve(__dirname, '../../../'), '<projectRootDir>')
    .replace(/\\/g, '/')
}

function trimAndNewline(string) {
  return `\n${string.trim()}\n`
}
