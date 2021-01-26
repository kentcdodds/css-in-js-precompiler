import React from 'react'
import injectSheet from 'react-jss'

const styles = {
  button: {
    fontWeight: 'bold',
  },
}

const Button = ({classes, children}) =>
  React.createElement('button', {className: classes.button})

export default injectSheet(styles)(Button)
