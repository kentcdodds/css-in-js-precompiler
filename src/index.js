import * as babel from 'babel-core'
import {renderStatic} from 'glamor/server'
import plugin from './plugin'

const defaultBabelOptions = {
  babelrc: false,
  sourceMaps: true,
  plugins: [[plugin, {a: 'b'}]],
}

module.exports = precompile

function precompile({source, sourceFile, babelOptions}) {
  let result
  const {css} = renderStatic(() => {
    if (sourceFile) {
      result = babel.transformFileSync(sourceFile, {
        filename: sourceFile,
        ...defaultBabelOptions,
        ...babelOptions,
      })
    } else {
      result = babel.transform(source, {
        ...defaultBabelOptions,
        ...babelOptions,
      })
    }
    return '<div>fake html to make glamor happy</div>'
  })
  return Object.assign(result, {css})
}
