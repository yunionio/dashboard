import { POLICY_RES_NAME_KEY_MAP, POLICY_WHITE_LIST } from '@/constants/policy'
import { POLICY_RES_LIST } from '@/constants/policy/policy-res-list'

export const getPolicyResList = () => {
  return POLICY_RES_LIST
}

const getServiceResourcePolicyOptions = (service, resource) => {
  let options = []
  for (let i = 0; i < POLICY_RES_LIST.length; i++) {
    const serviceItem = POLICY_RES_LIST[i]
    if (serviceItem.childrens) {
      for (let j = 0; j < serviceItem.childrens.length; j++) {
        const service2Item = serviceItem.childrens[j]
        if (service2Item.childrens) {
          for (let k = 0; k < service2Item.childrens.length; k++) {
            const resourceItem = service2Item.childrens[k]
            if (resourceItem.options && resourceItem.resource === resource && resourceItem.service === service) {
              options = resourceItem.options.map(item => item.key)
              return options
            }
          }
        }
      }
    }
  }
  return options
}

const getOptions = (policy, service, resource) => {
  const dataObj = {
    options: [...POLICY_WHITE_LIST],
    indeterminate: false,
    checkAll: false,
  }

  if (policy && policy.policy) {
    const servicePolicyMap = policy.policy[service] || policy.policy['*'] || {}
    const resourcePolicyMap = servicePolicyMap[resource] || servicePolicyMap['*'] || {}
    const denyArr = []
    for (const key in resourcePolicyMap) {
      if (Object.hasOwnProperty.call(resourcePolicyMap, key)) {
        const elementObj = resourcePolicyMap[key]
        if (key === '*') {
          // 获取默认操作列表
          const policyOptionsList = getServiceResourcePolicyOptions(service, resource)
          if (elementObj === 'allow') {
            dataObj.options.push(...policyOptionsList)
          } else {
            denyArr.push({ key: '*', value: 'deny' })
          }
          break
        }
        for (const key2 in elementObj) {
          if (Object.hasOwnProperty.call(elementObj, key2)) {
            const element = elementObj[key2]
            if (element === 'allow') {
              key2 === '*' ? dataObj.options.push(key) : dataObj.options.push(key2)
            } else {
              if (key2 === '*') {
                if (key !== 'perform') {
                  denyArr.push({ key: key, value: element })
                }
              } else {
                denyArr.push({ key: key2, value: element })
              }
            }
          }
        }
      }
    }
    dataObj.indeterminate = dataObj.options.length > POLICY_WHITE_LIST.length && denyArr.length > 0
    dataObj.checkAll = dataObj.options.length > POLICY_WHITE_LIST.length && denyArr.length === 0
  }

  return dataObj
}

export const getPolicyResCheckedList = (policy) => {
  const policyResCheckedListMap = {}

  Object.keys(POLICY_RES_NAME_KEY_MAP).forEach(item => {
    const service = POLICY_RES_NAME_KEY_MAP[item].service
    const resource = POLICY_RES_NAME_KEY_MAP[item].resource
    const dataObj = getOptions(policy, service, resource)
    policyResCheckedListMap[item] = {
      options: dataObj.options,
      indeterminate: dataObj.indeterminate,
      checkAll: dataObj.checkAll,
      service,
      resource,
    }
  })

  return policyResCheckedListMap
}
