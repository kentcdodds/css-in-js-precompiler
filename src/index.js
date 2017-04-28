import * as babel from 'babel-core'
import {renderStatic} from 'glamor/server'
import plugin from './plugin'

const babelOptions = {
  babelrc: false,
  sourceMaps: true,
  plugins: [plugin],
}

module.exports = precompile

function precompile({source, sourceFile}) {
  let result
  const {css} = renderStatic(() => {
    if (sourceFile) {
      result = babel.transformFileSync(sourceFile, babelOptions)
    } else {
      result = babel.transform(source, babelOptions)
    }
    return '<div>fake html to make glamor happy</div>'
  })
  return Object.assign(result, {css})
}
