// eslint-disable-next-line import/prefer-default-export
export {looksLike}

// generic utils
function looksLike(a, ...bs) {
  return (
    a &&
    bs.length &&
    bs.some(b =>
      Object.keys(b).every(bKey => {
        const bVal = b[bKey]
        const aVal = a[bKey]
        if (typeof bVal === 'function') {
          return bVal(aVal)
        }
        return isPrimitive(bVal) ? bVal === aVal : looksLike(aVal, bVal)
      }),
    )
  )
}

function isPrimitive(val) {
  // eslint-disable-next-line
  return val == null || /^[sbn]/.test(typeof val);
}
