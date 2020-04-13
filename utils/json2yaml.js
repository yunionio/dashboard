const spacing = '  '

function getType (obj) {
  const type = typeof obj
  if (obj instanceof Array) {
    return 'array'
  } else if (type === 'string') {
    return 'string'
  } else if (type === 'boolean') {
    return 'boolean'
  } else if (type === 'number') {
    return 'number'
  } else if (type === 'undefined' || obj === null) {
    return 'null'
  } else {
    return 'hash'
  }
}

function convert (obj, ret) {
  const type = getType(obj)
  switch (type) {
    case 'array':
      convertArray(obj, ret)
      break
    case 'hash':
      convertHash(obj, ret)
      break
    case 'string':
      convertString(obj, ret)
      break
    case 'null':
      ret.push('null')
      break
    case 'number':
      ret.push(obj.toString())
      break
    case 'boolean':
      ret.push(obj ? 'true' : 'false')
      break
  }
}

function convertArray (obj, ret) {
  if (obj.length === 0) {
    ret.push('[]')
  }
  for (let i = 0; i < obj.length; i++) {
    const ele = obj[i]
    const recurse = []
    convert(ele, recurse)
    for (let j = 0; j < recurse.length; j++) {
      ret.push((j === 0 ? '- ' : spacing) + recurse[j])
    }
  }
}

function convertHash (obj, ret) {
  for (let k in obj) {
    const recurse = []
    if (obj.hasOwnProperty(k)) {
      const ele = obj[k]
      convert(ele, recurse)
      const type = getType(ele)
      if (type === 'string' || type === 'null' || type === 'number' || type === 'boolean') {
        ret.push(normalizeString(k) + ': ' + recurse[0])
      } else {
        ret.push(normalizeString(k) + ': ')
        for (let i = 0; i < recurse.length; i++) {
          ret.push(spacing + recurse[i])
        }
      }
    }
  }
}

function normalizeString (str) {
  return str
  /*
  if (str.match(/^[\w]+$/)) {
    return str
  } else {
    return `${escape(str).replace(/%u/g, '\\u').replace(/%U/g, '\\U').replace(/%/g, '\\x')}`
  }
  */
}

function convertString (obj, ret) {
  ret.push(normalizeString(obj))
}

function json2yaml (obj) {
  if (typeof obj === 'string') {
    obj = JSON.parse(obj)
  }

  let ret = []
  convert(obj, ret)
  return ret.join('\n')
}

export default json2yaml
