import * as babel from 'babel-core'
import React from 'react'
import injectSheet, {SheetsRegistryProvider, SheetsRegistry} from 'react-jss'
import {looksLike} from '../utils'

const {types: t} = babel

module.exports = {
  shouldTranspile({code}) {
    return code.indexOf('react-jss') !== -1
  },
  start(callback) {
    const registry = new SheetsRegistry()
    React.createElement(SheetsRegistryProvider, {registry, children: []})
    const transformed = callback()
    return {transformed, css: registry.toString()}
  },
  getImportName(importPath) {
    const defaultSpecifierPath = importPath.get('specifiers')[0]
    if (
      importPath.node.source.value !== 'react-jss' ||
      !t.isImportDefaultSpecifier(defaultSpecifierPath)
    ) {
      return null
    }
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
          type: 'CallExpression',
        },
      })
    ) {
      return []
    }
    const callExpression = identifierPath.parentPath
    return callExpression.get('arguments')
  },
  getClassName(argument) {
    // TODO: this needs to be synchronous :-/
    let classNames
    injectSheet(argument)(({classes}) => {
      classNames = classes
    })
    return classNames
  },
}

function isRequireCall(callExpression) {
  return looksLike(callExpression, {
    type: 'CallExpression',
    callee: {
      name: 'require',
    },
    arguments: args => args.length === 1 && looksLike(args[0], {value: 'jss'}),
  })
}
