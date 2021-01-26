import fs from 'fs'
import * as babel from 'babel-core'
import babelPlugin from './babel-plugin'

const defaultBabelOptions = {
  babelrc: false,
  sourceMaps: true,
  plugins: [],
  parserOpts: {
    plugins: [
      // include all the things because why not?
      // 'estree', // except this one because why...?
      'jsx',
      'flow',
      'classConstructorCall',
      'doExpressions',
      'trailingFunctionCommas',
      'objectRestSpread',
      'decorators',
      'classProperties',
      'exportExtensions',
      'exponentiationOperator',
      'asyncGenerators',
      'functionBind',
      'functionSent',
      'dynamicImport',
      'asyncFunctions',
    ],
  },
}

module.exports = precompile

function precompile({sources = [], plugin: precompilerPlugin}) {
  return precompilerPlugin.start(() => {
    return sources
      .map(({filename, code = fs.readFileSync(filename, 'utf8'), ...rest}) => ({
        filename,
        code,
        ...rest,
      }))
      .map(({filename, code, babelOptions = {}}) => {
        if (!precompilerPlugin.shouldTranspile({code, filename})) {
          return {
            source: code,
            code,
            filename,
          }
        }
        const babelOptionsToUse = {
          filename,
          ...defaultBabelOptions,
          ...babelOptions,
        }
        babelOptionsToUse.plugins.unshift(babelPlugin(precompilerPlugin))
        return {
          source: code,
          filename,
          ...babel.transform(code, babelOptionsToUse),
        }
      })
  })
}
