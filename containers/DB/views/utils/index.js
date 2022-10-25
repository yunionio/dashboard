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

function isInstanceSupportSecgroup (obj, service, supportProviders) {
  const brand = obj.brand ? obj.brand : obj.hypervisor
  if (!supportProviders.includes(brand)) {
    return {
      validate: false,
      tooltip: i18n.t('db.action_diable_tooltip', [getI18n(`cloudPrvidersMap.${brand}`, brand)]),
    }
  }

  if (brand === 'Qcloud' && service === 'rds' && obj.category === 'basic') {
    return {
      validate: false,
      tooltip: i18n.t('db.secgroup.action_diable_tooltip', [getI18n(`cloudPrvidersMap.${brand}`, brand)]),
    }
  }

  return null
}

export const checkSecgroup = (val, service = 'rds', supportProviders = ['Huawei', 'Qcloud', 'Aliyun', 'HCS']) => {
  let objs = val
  if (!Array.isArray(val)) {
    objs = [val]
  }

  const errorMsgs = []
  objs.forEach(obj => {
    const ret = isInstanceSupportSecgroup(obj, service, supportProviders)
    if (ret) {
      errorMsgs.push(ret)
    }
  })

  if (errorMsgs.length > 0) {
    return errorMsgs[0]
  }
  return {
    validate: true,
  }
}
