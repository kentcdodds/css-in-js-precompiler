import {looksLike} from './utils'
import getLiteralizers from './get-literalizers'

export default getBabelPlugin

function getBabelPlugin({
  getImportName = () => null,
  getRequireName = () => null,
  getArgumentsPaths = () => [],
  getReplacementArg = requiredParam('getReplacementArg'),
}) {
  return cssInJSPrecompiler

  function cssInJSPrecompiler(babel) {
    const {types: t} = babel
    const cssInJsIdentifiers = new Set()
    return {
      name: 'css-in-js-precompiler',
      visitor: {
        ImportDeclaration(path) {
          const name = getImportName(path)
          if (!name) {
            return
          }
          const {referencePaths} = path.scope.getBinding(name)
          referencePaths.forEach(reference => {
            cssInJsIdentifiers.add(reference)
          })
        },
        VariableDeclarator(path) {
          const name = getRequireName(path)
          if (!name) {
            return
          }
          const {referencePaths} = path.scope.getBinding(name)
          referencePaths.forEach(reference => {
            cssInJsIdentifiers.add(reference)
          })
        },
        Program: {
          exit(programPath, state) {
            const toLiteral = getLiteralizers(state)
            Array.from(cssInJsIdentifiers).forEach(identifier => {
              const staticPaths = getArgumentsPaths(identifier)
                .reduce(
                  (paths, argPath) => paths.concat(getStaticPaths(argPath)),
                  [],
                )
                .filter(Boolean)
              staticPaths.forEach(staticPath => {
                staticPath.replaceWith(precompile(staticPath))
              })

              function precompile(literalNodePath) {
                let obj
                const {code} = babel.transformFromAst(
                  t.program([
                    t.expressionStatement(toLiteral(literalNodePath)),
                  ]),
                )
                // eslint-disable-next-line no-eval
                eval(`obj = ${code}`)
                return getReplacementArg(obj)
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
}

function requiredParam(name) {
  throw new Error(`${name} must be implemented`)
}
