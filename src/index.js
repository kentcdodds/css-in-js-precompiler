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

function precompile({sources, sourceFiles, babelOptions}) {
  let transformed
  const {css, ids} = renderStatic(() => {
    if (sourceFiles) {
      transformed = sourceFiles.map(filename =>
        babel.transformFileSync(filename, {
          filename,
          ...defaultBabelOptions,
          ...(typeof babelOptions === 'function' ?
            babelOptions(filename) :
            babelOptions),
        }),
      )
    } else {
      transformed = sources.map(src =>
        babel.transform(src, {
          ...defaultBabelOptions,
          ...(typeof babelOptions === 'function' ?
            babelOptions(src) :
            babelOptions),
        }),
      )
    }
    return '<div>fake html to make glamor happy</div>'
  })
  return {transformed, css, ids}
}
