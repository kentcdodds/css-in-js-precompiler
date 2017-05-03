import fs from 'fs'
import path from 'path'
import * as babel from 'babel-core'
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
    const filename = fixturePath(fixtureName)
    const sourceCode = fs.readFileSync(filename, 'utf8')
    const {transformed, css} = precompile({
      sources: [{filename, code: sourceCode, babelOptions}],
    })

    const [{code}] = transformed
    const output = trimAndNewline(
      [
        '\n',
        sourceCode.trim(),
        `\n\n    👇\n\n`,
        code.trim(),
        '\n\n',
        formatCSS(css),
        '\n',
      ].join(''),
    )

    expect(output).toMatchSnapshot(`${index + 1}. ${title}`)
  }
})

test('does not change code that should not be changed', () => {
  const sourceFile = path.join(__dirname, '__fixtures__/untouched.js')
  const source = fs.readFileSync(sourceFile, 'utf8')
  const {transformed, css} = precompile({
    sources: [{filename: sourceFile, babelOptions}],
  })

  const [{code}] = transformed
  expect(code.trim()).toEqual(source.trim())
  expect(css).toEqual('')
})

test('forwards along a bunch of stuff from babel', () => {
  const results = precompile({
    sources: [
      {
        code: stripIndent(
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
      },
    ],
  })
  expect(Object.keys(results.transformed[0])).toEqual([
    // just extra things that might be useful
    'source',
    'filename',
    // babel stuff
    'metadata',
    'options',
    'ignored',
    'code',
    'ast',
    'map',
  ])
  expect(Object.keys(results)).toEqual(['transformed', 'css', 'ids'])
})

test('can accept sources with just code or just filename', () => {
  const justFilename = [
    {filename: fixturePath('import.js')},
    {filename: fixturePath('require.js')},
  ]
  const justCode = [
    {code: `import glamorous from 'glamorous';glamorous.div({margin: 0})`},
    {code: `import glamorous from 'glamorous';glamorous.article({margin: 1})`},
  ]
  const {transformed, css} = precompile({
    sources: [...justCode, ...justFilename],
  })
  expect(transformed).toHaveLength(4)
  const output = trimAndNewline(
    [
      'justCode:\n  ',
      justCode.map(({code}) => code).join('\n  '),
      '\n\njustFiles:\n  ',
      justFilename.map(({filename}) => relativizePaths(filename)).join('\n  '),
      `\n\n    👇\n\n`,
      formatCSS(css),
    ].join(''),
  )
  expect(output).toMatchSnapshot(`css from 4 concatenated files`)
})

test('does not parse source which does not use `glamorous`', () => {
  const sources = [{code: 'import glamNotOrous from "glam-not-orous"'}]
  const sourceFiles = [fixturePath('glam-not-orous.js')]
  const transformSpy = jest.spyOn(babel, 'transform')
  precompile({sources, sourceFiles})
  expect(transformSpy).not.toHaveBeenCalled()
  transformSpy.mockRestore()
})

//////////////////// utils ////////////////////

function fixturePath(name) {
  return path.join(__dirname, '__fixtures__', name)
}

function formatCSS(css) {
  return cssParser.stringify(cssParser.parse(css)).trim()
}

/*
 * This takes the results object and removes environment-specific
 * elements from the path.
 */
function relativizePaths(filepath) {
  return filepath
    .replace(':/', ':\\')
    .replace(path.resolve(__dirname, '../../'), '<projectRootDir>')
    .replace(/\\/g, '/')
}

function trimAndNewline(string) {
  return `\n${string.trim()}\n`
}
