import * as babel from 'babel-core'
import * as glamor from 'glamor'
import {renderStatic} from 'glamor/server'
import {looksLike} from '../utils'

const {types: t} = babel

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
  getImportName(importPath) {
    if (
      !looksLike(
        importPath,
        {
          node: {
            source: {value: 'glamorous'},
            specifiers(specifiers) {
              return specifiers.some(s => s.type === 'ImportDefaultSpecifier')
            },
          },
        },
        {
          node: {
            source: {value: 'glamor'},
            specifiers(specifiers) {
              return specifiers.some(s =>
                looksLike(
                  s,
                  {type: 'ImportSpecifier', imported: {name: 'css'}},
                  {type: 'ImportNamespaceSpecifier'},
                ),
              )
            },
          },
        },
      )
    ) {
      return null
    }
    const defaultSpecifierPath = importPath
      .get('specifiers')
      .find(s => s.type === 'ImportDefaultSpecifier')
    const {node: {local: {name}}} = defaultSpecifierPath
    return name
  },
  getRequireName(variableDeclaratorPath) {
    const {node} = variableDeclaratorPath
    if (!isRequireCall(node.init) || !t.isIdentifier(node.id)) {
      return null
    }
    const {id: {name}} = node
    return name
  },
  getArgumentsPaths(identifierPath) {
    if (
      !looksLike(identifierPath, {
        parentPath: {
          type: type =>
            type === 'MemberExpression' || type === 'CallExpression',
          parentPath: {
            type: 'CallExpression',
          },
        },
      })
    ) {
      return []
    }
    const callExpression = identifierPath.parentPath.parentPath
    return callExpression.get('arguments')
  },
  getClassName(argument) {
    return glamor.css(argument).toString()
  },
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
