import _ from 'lodash'
import * as R from 'ramda'
// import ojectpath from 'objectpath'

const enumToOptions = function (enm) {
  const options = []
  _.each(enm, val => {
    let item = val // 默认是obj
    if (_.isString(item)) {
      item = {
        label: item,
        value: item,
      }
    }
    options.push(item)
  })
  return options
}

const parseErrors = function (errors) {
  const map = {}

  errors.forEach(err => {
    map[err.path.replace(/\.(\d+)\./g, '[$1].')] = err
  })

  return map
}

const undef = undefined

const removeEmptyValue = function (model) {
  const isArray = _.isArray(model)

  _.forEach(model, (value, key) => {
    if ((_.isString(value) && !value)) {
      isArray ? model.splice(key, 1, undef) : model[key] = undef
      return
    }

    if (_.isObject(value)) {
      if (_.isEmpty(value)) {
        model[key] = undef
      } else {
        removeEmptyValue(value)
      }
    }
  })
}

/**
 * 去除对象中所有符合条件的对象，默认是去除对象属性为空值
 * @param {Object} obj 来源对象
 * @param {Function} fn 函数验证每个字段
 */
const handleJsonSchemaProperties = (obj, fn) => {
  if (!R.is(Function, fn)) return obj
  const newObj = _.cloneDeep(obj)
  for (var i in newObj.properties) {
    const item = newObj.properties[i]
    if (item.properties) {
      handleJsonSchemaProperties(item, fn)
    }
    fn(i, item)
  }
  return newObj
}

export {
  enumToOptions,
  parseErrors,
  removeEmptyValue,
  handleJsonSchemaProperties,
}
