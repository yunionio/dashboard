import * as R from 'ramda'
import i18n from '@/locales'
import { getI18n } from '@/utils/i18n'

export const isRequiredData = (data, keys) => {
  if (!data || R.type(data) !== 'Object' || R.isEmpty(data)) {
    return false
  }
  if (!keys || R.isEmpty(keys)) {
    return !!data
  }
  const fn = {
    Array: () => {
      for (let i = 0; i < keys.length; i++) {
        // 没有发现data中存在 当前循环中的k
        if (!data[keys[i]]) {
          return false
        }
      }
      return true
    },
    Object: () => {
      for (const k in keys) {
        const v = keys[k]
        // 没有发现data中存在 当前循环中的k
        if (!data[k]) {
          return false
        }
        // 没有发现data存在当前循环的k， 但是value不一致
        if (data[k] && data[k] !== v) {
          return false
        }
      }
      return true
    },
  }
  const keyType = R.type(keys)
  return fn[keyType] && fn[keyType]()
}

export const checkSecgroup = (val, supportProviders = ['Huawei', 'Qcloud', 'Aliyun']) => {
  const errorMsgs = []
  if (Array.isArray(val)) {
    val.forEach(obj => {
      const brand = obj.brand ? obj.brand : obj.hypervisor
      if (!supportProviders.includes(brand)) {
        errorMsgs.push({
          validate: false,
          tooltip: i18n.t('db.action_diable_tooltip', [getI18n(`cloudPrvidersMap.${brand}`, brand)]),
        })
      }
    })
  } else {
    const brand = val.brand ? val.brand : val.hypervisor
    if (!supportProviders.includes(brand)) {
      errorMsgs.push({
        validate: false,
        tooltip: i18n.t('db.action_diable_tooltip', [getI18n(`cloudPrvidersMap.${brand}`, brand)]),
      })
    }
  }
  if (errorMsgs.length > 0) {
    return {
      validate: false,
      tooltip: errorMsgs[0].tooltip,
    }
  }
  return {
    validate: true,
  }
}
