import fs from 'fs'
import * as babel from 'babel-core'
import {renderStatic} from 'glamor/server'
import plugin from './plugin'

const defaultBabelOptions = {
  babelrc: false,
  sourceMaps: true,
  plugins: [],
  parserOpts: {plugins: ['jsx']},
}

module.exports = precompile

function precompile({sources = []}) {
  let transformed = []
  const {css, ids} = renderStatic(() => {
    transformed = sources
      .map(({filename, code = fs.readFileSync(filename, 'utf8'), ...rest}) => ({
        filename,
        code,
        ...rest,
      }))
      .filter(({code}) => hasGlamorous(code))
      .map(({filename, code, babelOptions = {}}) => {
        if (!hasGlamorous(code)) {
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
        babelOptionsToUse.plugins.unshift(plugin)
        return {
          source: code,
          filename,
          ...babel.transform(code, babelOptionsToUse),
        }
      })
    return '<div>fake html to make glamor happy</div>'
  })
  return {transformed, css, ids}
}

// TODO: when we support more than just glamorous, we'll want to
// expand this or even remove it entirely, but this ahead-of-time
// filtering is really handy for performance.
function hasGlamorous(code) {
  return code.indexOf('glamorous') !== -1
}
