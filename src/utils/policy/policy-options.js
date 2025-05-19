import { PERMISSION } from '@/constants/permission'
import i18n from '@/locales'
import store from '@/store'

const getRealPermis = (data) => {
  const { permission = '', label, permissionLabels = [] } = data
  const permis = permission.split(',')
  if (permis.length === permissionLabels.length) {
    return permis.map((p, idx) => {
      return {
        key: PERMISSION[p] ? PERMISSION[p][PERMISSION[p].length - 1] : p,
        label: permissionLabels[idx],
      }
    })
  }
  return [{
    key: PERMISSION[permis[0]] ? PERMISSION[permis[0]][PERMISSION[permis[0]].length - 1] : permis[0],
    label,
  }]
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
      item.getSingleActions({ $store: store }).forEach((obj, i) => {
        if (obj.action && obj.permission) {
          policyOptionsMap[item.name].push(...getRealPermis(obj))
        }
        if (obj.actions && obj.permission) {
          policyOptionsMap[item.name].push(...getRealPermis(obj))
        }
        if (obj.actions && !obj.permission) {
          const actions = obj.actions({})
          actions.forEach((actionObj) => {
            if (actionObj.action && actionObj.permission) {
              policyOptionsMap[item.name].push(...getRealPermis(actionObj))
            }
            if (actionObj.submenus) {
              actionObj.submenus.forEach((menuObj) => {
                if (menuObj.action && menuObj.permission) {
                  policyOptionsMap[item.name].push(...getRealPermis(menuObj))
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
