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
      sources: [{filename, code: sourceCode}],
      babelOptions,
    })

    const [{code}] = transformed
    const formattedCSS = cssParser.stringify(cssParser.parse(css)).trim()
    const spacer = `\n\n    👇\n\n`
    const output = [
      sourceCode.trim(),
      spacer,
      code.trim(),
      '\n\n',
      formattedCSS,
    ].join('')

    expect(`\n${output.trim()}\n`).toMatchSnapshot(`${index + 1}. ${title}`)
  }
})

test('does not change code that should not be changed', () => {
  const sourceFile = path.join(__dirname, '__fixtures__/untouched.js')
  const source = fs.readFileSync(sourceFile, 'utf8')
  const {transformed, css} = precompile({
    sourceFiles: [sourceFile],
    babelOptions,
  })

  const [{code}] = transformed
  expect(code.trim()).toEqual(source.trim())
  expect(css).toEqual('')
})

test('forwards along a bunch of stuff from babel', () => {
  const {transformed} = precompile({
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
  expect(Object.keys(transformed[0])).toEqual([
    'metadata',
    'options',
    'ignored',
    'code',
    'ast',
    'map',
  ])
})

test('concats results of both sources and sourceFiles', () => {
  const sources = [
    {code: `import glamorous from 'glamorous';glamorous.div({margin: 0})`},
    {code: `import glamorous from 'glamorous';glamorous.article({margin: 1})`},
  ]
  const sourceFiles = [fixturePath('import.js'), fixturePath('require.js')]
  const {transformed, css} = precompile({sources, sourceFiles})
  expect(transformed).toHaveLength(4)
  const formattedSources = `sources:\n  ${sources
    .map(({code}) => code)
    .join('\n  ')}`
  const formattedSourceFiless = `sourceFiles:\n  ${sourceFiles.join('\n  ')}`
  const spacer = `\n\n    👇\n\n`
  expect(
    `${formattedSources}\n\n${formattedSourceFiless}${spacer}${css}`,
  ).toMatchSnapshot(`css from 4 concatenated files`)
})

test('does not parse source which does not use `glamorous`', () => {
  const sources = [{code: 'import glamNotOrous from "glam-not-orous"'}]
  const sourceFiles = [fixturePath('glam-not-orous.js')]
  const transformSpy = jest.spyOn(babel, 'transform')
  precompile({sources, sourceFiles})
  expect(transformSpy).not.toHaveBeenCalled()
  transformSpy.mockRestore()
})

function fixturePath(name) {
  return path.join(__dirname, '__fixtures__', name)
}
