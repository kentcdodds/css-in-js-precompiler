import * as glamor from 'glamor'
import {renderStatic} from 'glamor/server'

module.exports = {
  shouldTranspile({code}) {
    return code.indexOf('glamorous') !== -1
  },
  start(callback) {
    let transformed
    const {css, ids} = renderStatic(() => {
      transformed = callback()
      return '<div>fake html to make glamor happy</div>'
    })
    glamor.flush() // make sure multiple runs don't mess things up
    return {transformed, css, ids}
  },
}
