import i18n from '@/locales'
import { PERMISSION as POLICY_MAP } from '@/constants/permission'
import { RESOURCES_MAP, SERVICES_MAP } from './constants'

export function transformLabel (config) {
  if (config) {
    if (config.i18n) return i18n.t(config.i18n)
    return config.label
  }
  return null
}

/**
 * 根据定义的 POLICY_MAP 生成 POLICY_GROUPS 供设置权限表单使用
 *
 * @returns { Array }
 */
export function genPolicyGroups () {
  const temp = {}
  // 存放找到的resources，保证唯一性
  const resources = []
  for (const key in POLICY_MAP) {
    const item = POLICY_MAP[key]
    // 将 POLICY_MAP 每项的 array value 第一项拿出来作为 key
    // 如果没有声明初始化进行
    if (!temp[item[0]]) {
      temp[item[0]] = {
        label: transformLabel(SERVICES_MAP[item[0]]) || item[0],
        service: item[0],
        resources: [],
      }
    }
    if (!resources.includes(item[1])) {
      resources.push(item[1])
      const res = {
        label: transformLabel(RESOURCES_MAP[item[1]]) || item[1],
        resource: item[1],
      }
      if (RESOURCES_MAP[item[1]] && RESOURCES_MAP[item[1]].extras) {
        res.extras = RESOURCES_MAP[item[1]].extras
      }
      temp[item[0]].resources.push(res)
    }
  }
  const ret = Object.values(temp).map(item => {
    return {
      ...item,
      resources: [...item.resources, { label: i18n.t('common.text00053'), resource: '*' }],
    }
  })
  return ret
}
