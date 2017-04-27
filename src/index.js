import * as babel from 'babel-core'
import {renderStatic} from 'glamor/server'
import visitor from './visitor'

module.exports = precompile

function precompile({source}) {
  let result
  const {css} = renderStatic(() => {
    result = babel.transform(source, {
      babelrc: false,
      sourceMaps: true,
      plugins: [visitor],
    })
    return '<div>fake html to make glamor happy</div>'
  })
  return Object.assign(result, {css})
}
