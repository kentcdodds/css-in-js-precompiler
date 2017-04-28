// uncomment this if you need to copy/paste this to astexplorer
/*
const glamor = {
  css() {
    return `css-${Math.random().toString().slice(2, 8)}`
  },
}
/**/
import * as glamor from 'glamor'

export default function(babel) {
  const {types: t} = babel
  const identifiers = new Set()
  return {
    name: 'glamorous-static',
    visitor: {
      ImportDeclaration(path) {
        const defaultSpecifierPath = path.get('specifiers')[0]
        if (
          path.node.source.value !== 'glamorous' ||
          !t.isImportDefaultSpecifier(defaultSpecifierPath)
        ) {
          return
        }
        const {node: {local: {name}}} = defaultSpecifierPath
        const {referencePaths} = path.scope.getBinding(name)
        referencePaths.forEach(reference => {
          identifiers.add(reference)
        })
      },
      VariableDeclarator(path) {
        const {node} = path
        if (!isRequireCall(node.init) || !t.isIdentifier(node.id)) {
          return
        }
        const {id: {name}} = node
        const binding = path.scope.getBinding(name)
        if (binding) {
          const {referencePaths} = binding
          referencePaths.forEach(reference => {
            identifiers.add(reference)
          })
        }
      },
      Program: {
        exit() {
          Array.from(identifiers).forEach(identifier => {
            const isGlamorousCall = looksLike(identifier, {
              parentPath: {
                type: type =>
                  type === 'MemberExpression' || type === 'CallExpression',
                parentPath: {
                  type: 'CallExpression',
                },
              },
            })
            if (!isGlamorousCall) {
              return
            }
            const callExpression = identifier.parentPath.parentPath
            const staticPaths = callExpression
              .get('arguments')
              .reduce(
                (paths, argPath) => paths.concat(getStaticPaths(argPath)),
                [],
              )
              .filter(Boolean)
            staticPaths.forEach(staticPath => {
              staticPath.replaceWith(t.stringLiteral(glamorize(staticPath)))
            })
          })
        },
      },
    },
  }

  // babel utils
  // not just using t.isLiteral because we will eventually
  // look for references to variables and see if _those_
  // things are static. Potentially even across files! 😱
  function getStaticPaths(path) {
    if (isStaticObject(path.node)) {
      return [path]
    }
    const staticObjectsInFunction = getStaticsInDynamic(path)
    return staticObjectsInFunction
  }

  function isStaticObject(node) {
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

  function getStaticsInDynamic(path) {
    const isSupportedFunction = looksLike(path, {
      node: {
        type: 'ArrowFunctionExpression',
        body: {
          type: 'ConditionalExpression',
          consequent: {type: 'ObjectExpression'},
          alternate: {type: 'ObjectExpression'},
        },
      },
    })
    if (!isSupportedFunction) {
      return []
    }
    const things = [
      ...getStaticPaths(path.get('body.consequent')),
      ...getStaticPaths(path.get('body.alternate')),
    ]
    return things
  }

  function isLiteral(node) {
    return isOne(node, [t.isNumericLiteral, t.isStringLiteral, isStaticObject])
  }
}

function isRequireCall(callExpression) {
  return looksLike(callExpression, {
    type: 'CallExpression',
    callee: {
      name: 'require',
    },
    arguments: args =>
      args.length === 1 && looksLike(args[0], {value: 'glamorous'}),
  })
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
