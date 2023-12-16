export const groupBy = (arr, fn) => {
  const obj = {}
  arr.forEach(item => {
    const key = fn(item)
    obj[key] = obj[key] || []
    obj[key].push(item)
  })
  return Object.keys(obj).map(k => {
    return {
      name: k,
      data: obj[k],
    }
  })
}
