import { POLICY_RES_NAME_KEY_MAP, POLICY_WHITE_LIST } from '@/constants/policy'
import { POLICY_RES_LIST } from '@/constants/policy/policy-res-list'

export const getPolicyResList = () => {
  return POLICY_RES_LIST
}

const getOptions = (policy, service, resource) => {
  const dataObj = {
    options: [...POLICY_WHITE_LIST],
    indeterminate: false,
    checkAll: false,
  }

  if (policy && policy.policy) {
    const optionObj = policy.policy[service][resource]
    const denyArr = []
    for (const key in optionObj) {
      if (Object.hasOwnProperty.call(optionObj, key)) {
        const elementObj = optionObj[key]
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
