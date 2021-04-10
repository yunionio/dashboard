import _ from 'lodash'

const getDefinition = function (path = '', definition) {
  if (!path) {
    return definition
  }

  path = _.toPath(path)

  const newPath = []
  path.forEach(key => {
    if (/^\d+$/.test(key)) {
      newPath.push('0')
    } else {
      newPath.push(key)
    }
  })

  const len = newPath.length
  let def = definition
  let keys = []
  let kLen = 0

  while (kLen < len) {
    kLen = kLen + 1
    keys = newPath.slice(0, kLen)
    def = _.find(kLen === 1 ? def : (def.items || []), function (item) {
      return _.isEqual(_.toPath(item.key), keys)
    })

    if (!def) {
      break
    }
  }

  return def
}

export {
  getDefinition,
}
