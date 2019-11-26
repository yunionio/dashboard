// 此文件用于解析 vue.ant.design 返回的一些数据格式
import * as R from 'ramda'

/**
 * @description 将 ant.design form 的 onFieldsChange 方法的回调参数解析成 formData
 * @param {Object} changedFields { zone: { value: { key: <id>, label: ’YunionHQ‘ }, name: 'zone' } } -> { zone: { key: <id>, label: ’YunionHQ‘ } }
 */
export const resolveChangeField = changedFields => {
  let fields = {}
  R.forEachObjIndexed(obj => {
    if (obj.name) {
      fields[obj.name] = obj.value
    } else {
      fields = { ...fields, ...resolveChangeField(obj) }
    }
  }, changedFields)
  return fields
}

/**
 * @description 将 ant.design form 的 onValuesChange 方法的回调参数解析成 formData
 * @param {Object} changedFields { zone: { value: { key: <id>, label: ’YunionHQ‘ }, name: 'zone' } } -> { zone: { key: <id>, label: ’YunionHQ‘ } }
 */
export const resolveValueChangeField = changedFields => {
  let fields = {}
  R.forEachObjIndexed((obj, key) => {
    fields[key] = obj
  }, changedFields)
  return fields
}

/**
 * @description 将 decorators 里面的 initialValue 数据转换为普通对象
 * @param {Object} decorators { zone: ['zone', { initialValue: '' }], image: { type: ['imageType', { initialValue: 'standard' }] } } -> { zone: '', imageType: '' }
 */
export const getInitialValue = decorators => {
  let initData = {}
  R.forEachObjIndexed((value, key) => {
    if (R.is(Array, value)) {
      if (value[1] && value[1].initialValue !== undefined) {
        initData[value[0]] = value[1].initialValue
      }
    } else if (R.is(Object, value) && !R.is(Function, value)) {
      initData = { ...getInitialValue(value), ...initData }
    }
    return initData
  }, decorators)
  return initData
}
