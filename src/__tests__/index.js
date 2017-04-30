import fs from 'fs'
import path from 'path'
import cssParser from 'css'
import stripIndent from 'strip-indent'
import * as glamor from 'glamor'
import * as recast from 'recast'

const precompile = require('../')

const babelOptions = {
  parserOpts: {parser: recast.parse},
  generatorOpts: {generator: recast.print, lineTerminator: '\n'},
}

afterEach(() => {
  glamor.flush()
})

const tests = [
  {
    title: 'follows imports',
    fixtureName: 'import.js',
  },
  {
    title: 'follows requires',
    fixtureName: 'require.js',
  },
  {
    title: 'supports statics in arrow functions',
    fixtureName: 'arrow-ternary.js',
  },
  {
    title: 'follows references',
    fixtureName: 'references.js',
  },
  {
    title: 'when creating custom glamorous components',
    fixtureName: 'wrapped-component.js',
  },
  {
    title: 'styles using member expressions',
    fixtureName: 'member-expression-reference.js',
  },
  {
    modifier: 'skip',
    title: 'styles using variables across files',
    fixtureName: 'imported-styles.js',
  },
]

tests.forEach(({title, fixtureName, modifier}, index) => {
  if (modifier) {
    test[modifier](title, testFn)
  } else {
    test(title, testFn)
  }
  function testFn() {
    const sourceFile = path.join(__dirname, '__fixtures__', fixtureName)
    const source = fs.readFileSync(sourceFile, 'utf8')
    const result = precompile({source, babelOptions})

    const {code, css} = result
    const formattedCSS = cssParser.stringify(cssParser.parse(css)).trim()
    const spacer = `\n\n    👇\n\n`
    const output = `${source.trim()}${spacer}${code.trim()}\n\n${formattedCSS}`

    expect(`\n${output.trim()}\n`).toMatchSnapshot(`${index + 1}. ${title}`)
  }
})

test('does not change code that should not be changed', () => {
  const sourceFile = path.join(__dirname, '__fixtures__/untouched.js')
  const source = fs.readFileSync(sourceFile, 'utf8')
  const result = precompile({sourceFile, babelOptions})

  const {code, css} = result
  expect(code.trim()).toEqual(source.trim())
  expect(css).toEqual('')
})

test('forwards along a bunch of stuff from babel', () => {
  const result = precompile({
    source: stripIndent(
      `
        import glamorous from 'glamorous'
        glamorous.div(
          {
            fontSize: 20,
            fontWeight: 'normal',
          },
          {
            margin: 20,
            ':hover': {
              margin: 10,
            },
          },
        )
        someOtherCall({fontSize: 30})
      `,
    ).trim(),
  })
  expect(Object.keys(result)).toEqual([
    'metadata',
    'options',
    'ignored',
    'code',
    'ast',
    'map',
    'css',
  ])
})
