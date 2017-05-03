# css-in-js-precompiler

Precompiles static CSS-in-JS objects to CSS strings

**CURRENTLY A WORK IN PROGRESS**

<!--
WHEN IT'S RELEASED WE CAN COMMENT THIS BACK IN :)
[![Build Status][build-badge]][build]
[![Code Coverage][coverage-badge]][coverage]
[![Dependencies][dependencyci-badge]][dependencyci]
[![version][version-badge]][package]
[![downloads][downloads-badge]][npm-stat]
[![MIT License][license-badge]][LICENSE]

[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors)
[![PRs Welcome][prs-badge]][prs]
[![Donate][donate-badge]][donate]
[![Code of Conduct][coc-badge]][coc]
[![Roadmap][roadmap-badge]][roadmap]
[![Examples][examples-badge]][examples]

[![Watch on GitHub][github-watch-badge]][github-watch]
[![Star on GitHub][github-star-badge]][github-star]
[![Tweet][twitter-badge]][twitter]
-->

## The problem

You love the benefits of CSS-in-JS, but don't love some of the performance
characteristics and trade-offs you have to make with regards to not using actual
CSS files.

## This solution

This module takes in your source code and gives you back the source code with
the literal CSS-in-JS objects swapped for class names as well as the generated
CSS. You can then use that to create a css file and deploy that.

**It's still pretty early stages**

## Installation

<!--
WHEN IT'S RELEASED WE CAN COMMENT THIS BACK IN.
This module is distributed via [npm][npm] which is bundled with [node][node] and
should be installed as one of your project's `devDependencies`:

```
npm install --save-dev css-in-js-precompiler
```
-->

This is not yet published. But you can install it anyway with:

```
npm install kentcdodds/css-in-js-precompiler
cd node_modules/css-in-js-precompiler
npm install
npm start build
```

And you should be able to use it now :)

## Usage

This is still under development so the API and assumptions are going to change.
But right now, we're naïvely assuming you're using `glamorous`. _But this
solution will be modified to work with **any** CSS-in-JS library you're using_.

```javascript
const precompileCSSInJS = require('css-in-js-precompiler')
const options = {
  sources: [
    {
      code: `import glamorous from 'glamorous';\nglamorous.div({fontSize: 23})`,
      filename: '/some/path.js',
      babelOptions: {/* optional. Shallowly merges with the default babelOptions */}
    },
  ],
}

const result = precompileCSSInJS(options)
result.transformed[0].code === `import glamorous from 'glamorous';\nglamorous.div("css-my79es");`
result.transformed[0].map === '<the code source map>'
result.css === '.css-my79es,[data-css-my79es]{font-size:23px;}'
```

### options

#### `sources`

This is an array of `SourceObjects` which will be used to determine what source
to precompile and how. Here are the available properties on these objects:

#### code

This is the source code to actually precompile. If this is not provided, then
the code will be derived from the `filename`.

##### filename

This is a string path to the filename. If the `code` is not provided, this will
be used to read the file. If this is not provided, then you will be unable to
handle importing dynamic values from other files.

#### babelOptions

This is the same thing you would pass to `babel.transform` if you were calling
it yourself. Read more [here](http://babeljs.io/docs/core-packages/#options).
This will be shallowly merged with the default `babelOptions`. Currently
(2017-05-03) the default babelOptions are:

```javascript
{
  babelrc: false,
  sourceMaps: true,
  plugins: [/* our custom plugin to do this extraction */],
  parserOpts: {plugins: [/* all of them except estree */]},
}
```

This is shallowly merged, with the exception of `plugins`. You can specify any
plugins you want and we'll make sure we always include our own plugin to do
the precompiling. (You're welcome).

## Inspiration

I started thinking about this around [here][inspiration-link].

## Other Solutions

I'm not aware of any, if you are please [make a pull request][prs] and add it
here!

## Contributors

Thanks goes to these people ([emoji key][emojis]):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
| [<img src="https://avatars.githubusercontent.com/u/1500684?v=3" width="100px;"/><br /><sub>Kent C. Dodds</sub>](https://kentcdodds.com)<br />[💻](https://github.com/kentcdodds/css-in-js-precompiler/commits?author=kentcdodds) [📖](https://github.com/kentcdodds/css-in-js-precompiler/commits?author=kentcdodds) 🚇 [⚠️](https://github.com/kentcdodds/css-in-js-precompiler/commits?author=kentcdodds) |
| :---: |
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors][all-contributors] specification.
Contributions of any kind welcome!

## LICENSE

MIT

[npm]: https://www.npmjs.com/
[node]: https://nodejs.org
[build-badge]: https://img.shields.io/travis/kentcdodds/css-in-js-precompiler.svg?style=flat-square
[build]: https://travis-ci.org/kentcdodds/css-in-js-precompiler
[coverage-badge]: https://img.shields.io/codecov/c/github/kentcdodds/css-in-js-precompiler.svg?style=flat-square
[coverage]: https://codecov.io/github/kentcdodds/css-in-js-precompiler
[dependencyci-badge]: https://dependencyci.com/github/kentcdodds/css-in-js-precompiler/badge?style=flat-square
[dependencyci]: https://dependencyci.com/github/kentcdodds/css-in-js-precompiler
[version-badge]: https://img.shields.io/npm/v/css-in-js-precompiler.svg?style=flat-square
[package]: https://www.npmjs.com/package/css-in-js-precompiler
[downloads-badge]: https://img.shields.io/npm/dm/css-in-js-precompiler.svg?style=flat-square
[npm-stat]: http://npm-stat.com/charts.html?package=css-in-js-precompiler&from=2016-04-01
[license-badge]: https://img.shields.io/npm/l/css-in-js-precompiler.svg?style=flat-square
[license]: https://github.com/kentcdodds/css-in-js-precompiler/blob/master/other/LICENSE
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com
[donate-badge]: https://img.shields.io/badge/$-support-green.svg?style=flat-square
[donate]: http://kcd.im/donate
[coc-badge]: https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square
[coc]: https://github.com/kentcdodds/css-in-js-precompiler/blob/master/other/CODE_OF_CONDUCT.md
[roadmap-badge]: https://img.shields.io/badge/%F0%9F%93%94-roadmap-CD9523.svg?style=flat-square
[roadmap]: https://github.com/kentcdodds/css-in-js-precompiler/blob/master/other/ROADMAP.md
[examples-badge]: https://img.shields.io/badge/%F0%9F%92%A1-examples-8C8E93.svg?style=flat-square
[examples]: https://github.com/kentcdodds/css-in-js-precompiler/blob/master/other/EXAMPLES.md
[github-watch-badge]: https://img.shields.io/github/watchers/kentcdodds/css-in-js-precompiler.svg?style=social
[github-watch]: https://github.com/kentcdodds/css-in-js-precompiler/watchers
[github-star-badge]: https://img.shields.io/github/stars/kentcdodds/css-in-js-precompiler.svg?style=social
[github-star]: https://github.com/kentcdodds/css-in-js-precompiler/stargazers
[twitter]: https://twitter.com/intent/tweet?text=Check%20out%20css-in-js-precompiler!%20https://github.com/kentcdodds/css-in-js-precompiler%20%F0%9F%91%8D
[twitter-badge]: https://img.shields.io/twitter/url/https/github.com/kentcdodds/css-in-js-precompiler.svg?style=social
[emojis]: https://github.com/kentcdodds/all-contributors#emoji-key
[all-contributors]: https://github.com/kentcdodds/all-contributors
[inspiration-link]: https://github.com/paypal/glamorous/issues/43#issuecomment-294153104
