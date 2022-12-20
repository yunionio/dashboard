import { PERMISSION } from '@/constants/permission'
import i18n from '@/locales'

const getRealPermis = (permission) => {
  const permis = permission.split(',')[0]
  return PERMISSION[permis] ? PERMISSION[permis][PERMISSION[permis].length - 1] : permis
}

// 加载模块操作数据
export const getPolicyOptions = () => {
  const req = require.context('@containers', true, /actions\.js$/)
  const requireAll = ctx => ctx.keys().map(ctx)
  const policyOptionsMap = {}
  const commonOptions = [
    { key: 'list', label: i18n.t('policyDefaultActions.list') },
    { key: 'get', label: i18n.t('policyDefaultActions.get') },
    { key: 'update', label: i18n.t('policyDefaultActions.update') },
    { key: 'create', label: i18n.t('policyDefaultActions.create') },
    { key: 'delete', label: i18n.t('policyDefaultActions.delete') },
    // { key: 'perform', label: '执行操作' },
  ]
  if (Object.keys(policyOptionsMap).length > 0) return policyOptionsMap

  requireAll(req).forEach(({ default: item }) => {
    if (item && item.name) {
      policyOptionsMap[item.name] = [...commonOptions]
      item.getSingleActions().forEach((obj, i) => {
        if (obj.action && obj.permission) {
          policyOptionsMap[item.name].push({ key: getRealPermis(obj.permission), label: obj.label })
        }
        if (obj.actions && obj.permission) {
          policyOptionsMap[item.name].push({ key: getRealPermis(obj.permission), label: obj.label })
        }
        if (obj.actions && !obj.permission) {
          const actions = obj.actions({})
          actions.forEach(({ action, submenus, permission, label }) => {
            if (action && permission) {
              policyOptionsMap[item.name].push({ key: getRealPermis(permission), label: label })
            }
            if (submenus) {
              submenus.forEach(({ action, permission, label }) => {
                if (action && permission) {
                  policyOptionsMap[item.name].push({ key: getRealPermis(permission), label: label })
                }
              })
            }
          })
        }
      })
    }
  })
  return policyOptionsMap
}
