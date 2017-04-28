import stripIndent from 'strip-indent'
import * as recast from 'recast'
import * as babel from 'babel-core'
import plugin from '../plugin'

test('converts static objects to css class names', () => {
  const source = `
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
  `
  const code = transpile(source)
  expect(code).toMatchSnapshot()
})

function transpile(source) {
  const {code} = babel.transform(stripIndent(source).trim(), {
    parserOpts: {parser: recast.parse},
    generatorOpts: {generator: recast.print, lineTerminator: '\n'},
    babelrc: false,
    plugins: [plugin],
  })
  return code
}
