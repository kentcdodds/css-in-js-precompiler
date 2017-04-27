import path from 'path'
import stripIndent from 'strip-indent'
import * as recast from 'recast'
import * as babel from 'babel-core'
import glamorousStatic from './visitor'

test('converts static objects to css class names', () => {
  const source = `
    glamorous(
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
  `
  const code = transpile(source)
  expect(code).toMatchSnapshot()
})

function transpile(source) {
  const {code} = babel.transform(stripIndent(source).trim(), {
    parserOpts: {parser: recast.parse},
    generatorOpts: {generator: recast.print, lineTerminator: '\n'},
    babelrc: false,
    plugins: [
      [glamorousStatic, {outputFile: path.join(__dirname, './out/glamor.css')}],
    ],
  })
  return code
}
