// this is used in `eval` 😱
// eslint-disable-next-line no-unused-vars
import * as glamor from 'glamor'

export default glamorousStatic

function glamorousStatic(babel) {
  const {types: t} = babel
  return {
    name: 'glamorous-static',
    visitor: {
      CallExpression(path) {
        const isGlamorousCall = looksLike(path, {
          node: {callee: {name: 'glamorous'}},
        })
        if (!isGlamorousCall) {
          return
        }
        const staticArgs = path
          .get('arguments')
          .filter(arg => isStatic(arg.node))
        staticArgs.forEach(staticArg => {
          staticArg.replaceWith(t.stringLiteral(glamorize(staticArg)))
        })
      },
    },
  }

  // babel utils
  // not just using isLiteral because we will eventually
  // look for references to variables and see if _those_
  // things are static. Potentially even across files! 😱
  function isStatic(node) {
    return looksLike(node, {
      type: 'ObjectExpression',
      properties: props => {
        return props.every(prop =>
          looksLike(prop, {
            computed: false,
            method: false,
            value: isLiteral,
          }),
        )
      },
    })
  }

  function isLiteral(node) {
    return isOne(node, [t.isNumericLiteral, t.isStringLiteral, isStatic])
  }
}

function glamorize(literalNodePath) {
  const source = literalNodePath.getSource()
  let obj
  // eslint-disable-next-line no-eval
  eval(`obj = ${source}`)
  const className = glamor.css(obj).toString()
  return className
}

// generic utils
function isOne(arg, fns) {
  return fns.some(fn => fn(arg))
}

function looksLike(a, b) {
  return (
    a &&
    b &&
    Object.keys(b).every(bKey => {
      const bVal = b[bKey]
      const aVal = a[bKey]
      if (typeof bVal === 'function') {
        return bVal(aVal)
      }
      return isPrimitive(bVal) ? bVal === aVal : looksLike(aVal, bVal)
    })
  )
}

function isPrimitive(val) {
  // eslint-disable-next-line
  return val == null || /^[sbn]/.test(typeof val);
}
