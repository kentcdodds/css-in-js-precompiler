import fs from 'fs'
import * as babel from 'babel-core'
import {renderStatic} from 'glamor/server'
import plugin from './plugin'

const defaultBabelOptions = {
  babelrc: false,
  sourceMaps: true,
  plugins: [plugin],
  parserOpts: {plugins: ['jsx']},
}

module.exports = precompile

function precompile({sources = [], sourceFiles = [], babelOptions}) {
  let transformed = []
  const {css, ids} = renderStatic(() => {
    transformed = sourceFiles
      .map(filename => ({filename, code: fs.readFileSync(filename, 'utf8')}))
      .concat(sources)
      .filter(({code}) => hasGlamorous(code))
      .map(({filename, code}) =>
        babel.transform(code, {
          filename,
          ...defaultBabelOptions,
          ...(typeof babelOptions === 'function' ?
            babelOptions(filename, code) :
            babelOptions),
        }),
      )
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
