import cssParser from 'css'
import stripIndent from 'strip-indent'

const precompile = require('./')

test('precompiles css-in-js source code', () => {
  const result = precompile({
    source: stripIndent(
      `
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
        someOtherCall({fontSize: 30})
      `,
    ).trim(),
  })
  const {code, css} = result
  const formattedCSS = cssParser.stringify(cssParser.parse(css))
  expect(code).toMatchSnapshot('1. sanity test code')
  expect(formattedCSS).toMatchSnapshot('2. sanity test css')
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
