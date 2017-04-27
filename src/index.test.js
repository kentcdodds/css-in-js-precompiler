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
  expect({code, css}).toMatchSnapshot()
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
