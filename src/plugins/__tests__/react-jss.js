import fs from 'fs'
import * as recast from 'recast'
import {formatOutput, fixturePath} from './helpers/utils'

const reactJssPlugin = require('../react-jss')
const precompile = require('../../')

const babelOptions = {
  parserOpts: {parser: recast.parse},
  generatorOpts: {generator: recast.print, lineTerminator: '\n'},
}

const tests = [
  {
    modifier: 'skip',
    title: 'basic',
    fixtureName: 'basic.js',
  },
]

tests.forEach(({title, fixtureName, modifier}, index) => {
  if (modifier) {
    test[modifier](title, testFn)
  } else {
    test(title, testFn)
  }
  function testFn() {
    const filename = fixturePath(`jss/${fixtureName}`)
    const sourceCode = fs.readFileSync(filename, 'utf8')
    const {transformed, css} = precompile({
      plugin: reactJssPlugin,
      sources: [{filename, code: sourceCode, babelOptions}],
    })

    const [{code}] = transformed
    const output = formatOutput({sourceCode, code, css})

    expect(code).not.toBe(sourceCode)
    expect(css).toBeTruthy()
    expect(output).toMatchSnapshot(`${index + 1}. ${title}`)
  }
})
