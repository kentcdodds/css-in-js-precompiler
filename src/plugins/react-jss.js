import * as babel from 'babel-core'
import React from 'react'
import {renderToString} from 'react-dom/server'
import injectSheet, {SheetsRegistryProvider, SheetsRegistry} from 'react-jss'
import {looksLike} from '../utils'

const registry = new SheetsRegistry()

const {types: t} = babel

module.exports = {
  shouldTranspile({code}) {
    return code.indexOf('react-jss') !== -1
  },
  start(callback) {
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
  getReplacementArg(argument) {
    let classNames
    const Temp = injectSheet(argument)(({classes}) => {
      classNames = classes
      return null
    })
    renderToString(
      React.createElement(SheetsRegistryProvider, {
        registry,
        children: React.createElement(Temp),
      }),
    )
    return t.objectExpression(
      Object.keys(classNames).reduce((props, key) => {
        const className = classNames[key]
        props.push(
          t.objectProperty(t.identifier(key), t.stringLiteral(className)),
        )
        return props
      }, []),
    )
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
