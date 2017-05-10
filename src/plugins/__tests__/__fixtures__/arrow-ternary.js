import glamorous from 'glamorous'

glamorous.div(
  ({big}) =>
    (big
      ? {
          fontSize: 20,
        }
      : {
          fontSize: 12,
        })
)
