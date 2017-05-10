import {css} from 'glamor'
import * as glamor from 'glamor'

const myClass = css({fontSize: 5})
const myOtherClass = glamor.css({margin: 20})

document.body.className = `${myClass} ${myOtherClass}`
