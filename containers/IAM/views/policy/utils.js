import i18n from '@/locales'
import { PERMISSION as POLICY_MAP } from '@/constants/permission'
import { RESOURCES_MAP, SERVICES_MAP } from './constants'

/**
 * 翻译权限展示名
 * 1. 优先查找 SERVICES_MAP RESOURCES_MAP 指定的名
 * 2. 查找 i18n 中 `${service}.${resourceKey}` 的名称
 * 3. 查找 i18n 中 `dictionary.${resourceKey}` 的名称
 * 4. 都找不到时，返回 resourceKey
 * 建议：ce 中涉及的，可在 dictionary 和 SERVICES_MAP、RESOURCES_MAP 添加，ee 和 oem 涉及的，添加至 该模块`${service}.${resourceKey}` 即可
 */
export function transformLabel (config, resourceKey, service) {
  if (config) {
    if (config.i18n) return i18n.t(config.i18n)
    return config.label
  } else if (service && i18n.te(`${service}.${resourceKey}`)) {
    return i18n.t(`${service}.${resourceKey}`)
  }
  return i18n.te(`dictionary.${resourceKey}`) ? i18n.t(`dictionary.${resourceKey}`) : resourceKey
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
        label: transformLabel(SERVICES_MAP[item[0]], item[0]),
        service: item[0],
        resources: [],
      }
    }
    // 由验证<resource>为唯一项，改为验证<service>_<resource>
    if (!resources.includes(`${item[0]}_${item[1]}`)) {
      resources.push(`${item[0]}_${item[1]}`)
      const res = {
        label: transformLabel(RESOURCES_MAP[item[1]], item[1], item[0]),
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
      resources: [...item.resources, { label: i18n.t('iam.others'), resource: '*' }],
    }
  })
  return ret
}
