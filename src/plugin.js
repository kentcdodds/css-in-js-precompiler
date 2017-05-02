import * as glamor from 'glamor'
import getLiteralizers from './get-literalizers'

export default function(babel) {
  const {types: t} = babel
  const glamorousIdentifiers = new Set()
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
          glamorousIdentifiers.add(reference)
        })
      },
      VariableDeclarator(path) {
        const {node} = path
        if (!isRequireCall(node.init) || !t.isIdentifier(node.id)) {
          return
        }
        const {id: {name}} = node
        const binding = path.scope.getBinding(name)
        const {referencePaths} = binding
        referencePaths.forEach(reference => {
          glamorousIdentifiers.add(reference)
        })
      },
      Program: {
        exit(programPath, state) {
          const toLiteral = getLiteralizers(state)
          Array.from(glamorousIdentifiers).forEach(identifier => {
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

            function glamorize(literalNodePath) {
              let obj
              const {code} = babel.transformFromAst(
                t.program([t.expressionStatement(toLiteral(literalNodePath))]),
              )
              // eslint-disable-next-line no-eval
              eval(`obj = ${code}`)
              const className = glamor.css(obj).toString()
              return className
            }
          })

          // babel utils
          function getStaticPaths(path) {
            const pathGetters = [
              getStaticObjectPaths,
              getStaticsInDynamic,
              getStaticReferences,
            ]
            return pathGetters.reduce((pathsAlreadyGotten, pathGetter) => {
              if (pathsAlreadyGotten) {
                return pathsAlreadyGotten
              }
              const paths = pathGetter(path)
              if (paths.length) {
                return paths
              }
              return null
            }, null)
          }

          function getStaticObjectPaths(path) {
            if (path.type !== 'ObjectExpression') {
              return []
            }
            return [path]
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

          function getStaticReferences(path) {
            if (path.type !== 'Identifier') {
              return []
            }
            const binding = path.scope.getBinding(path.node.name)
            if (binding) {
              return getStaticObjectPaths(binding.path.get('init'))
            } else {
              return []
            }
          }
        },
      },
    },
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

// generic utils
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
