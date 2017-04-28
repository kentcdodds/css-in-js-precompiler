import path from 'path'
import cssParser from 'css'
import stripIndent from 'strip-indent'

const precompile = require('../')

const tests = [
  {
    title: 'follows imports',
    // modifier: 'only',
    fixtureName: 'import.js',
  },
  {
    title: 'follows requires',
    fixtureName: 'require.js',
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
    const result = precompile({sourceFile})
    const {code, css} = result
    const formattedCSS = cssParser.stringify(cssParser.parse(css))
    expect(`${formattedCSS}\n\n${code}`).toMatchSnapshot(
      `${index + 1}. ${title}`,
    )
  }
})

test('accepts a source string', () => {
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
  const {code, css} = result
  const formattedCSS = cssParser.stringify(cssParser.parse(css))
  expect(`${formattedCSS}\n\n${code}`).toMatchSnapshot('0. source string')
  // we send along everything that babel gives us
  // and we don't really care to snapshot that
  // but it'd be nice to know if one of those changes
  // in the future :)
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
