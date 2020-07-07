import _ from 'lodash'
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

export {
  enumToOptions,
  parseErrors,
  removeEmptyValue,
}
