import i18n from '@/locales'
import store from '@/store'

function getSelectedData (row, vm) {
  return row ? [row] : (vm.list && vm.list.selectedItems) || []
}

export function disableDeleteAction (params = {}, dialogParams = {}) {
  const { name = '实例' } = dialogParams
  const { list, onManager, columns, createDialog, ...optionParams } = params
  const getData = (row) => row ? [row] : list.selectedItems
  const options = {
    label: '设置删除保护',
    action: (row) => {
      createDialog('ChangeDisableDelete', {
        name,
        data: getData(row),
        onManager,
        columns,
      })
    },
    meta: (row) => {
      const validate = getData(row) && getData(row).length > 0
      return {
        validate: validate,
        tooltip: !validate && `请选择需要操作的${name}`,
      }
    },
    ...optionParams,
  }
  return options
}

// 更改域
export function getDomainChangeOwnerAction (vm, dialogParams = {}, params = {}) {
  if (!vm) {
    throw Error('not found vm instance')
  }
  const { name = '实例', resource } = dialogParams
  const options = {
    label: `更改${i18n.t('dictionary.domain')}`,
    action: row => {
      vm.createDialog('DomainChangeOwenrDialog', {
        vm,
        name,
        data: getSelectedData(row, vm),
        onManager: vm.onManager,
        columns: vm.columns,
        refresh: vm.refresh,
        resource,
      })
    },
    meta: row => {
      if (params.meta) {
        return params.meta(row)
      }
      const data = getSelectedData(row, vm)
      const ret = {
        validate: data && data.length > 0,
        tooltip: null,
      }
      if (!store.getters.l3PermissionEnable || !store.getters.isAdminMode) ret.validate = false
      if (data.some(item => item.is_public && item.public_scope !== 'none')) {
        ret.validate = false
        ret.tooltip = '只有共享范围为不共享的才支持该操作'
      }
      return ret
    },
  }
  return options
}

// 设置域资源共享
export function getSetPublicAction (vm, dialogParams = {}, params = {}) {
  if (!vm) {
    throw Error('not found vm instance')
  }
  const { name = '实例', scope } = dialogParams
  const options = {
    label: '设置共享',
    action: row => {
      vm.createDialog('SetPublicDialog', {
        vm,
        name,
        data: getSelectedData(row, vm),
        onManager: vm.onManager,
        refresh: vm.refresh,
        columns: vm.columns,
        scope,
      })
    },
    meta: row => {
      if (params.meta) {
        return params.meta(row)
      }
      const data = getSelectedData(row, vm)
      const ret = {
        validate: data && data.length > 0,
        tooltip: null,
      }
      if (!store.getters.l3PermissionEnable) {
        ret.validate = false
        return ret
      }
      if (store.getters.isAdminMode) {
        ret.validate = true
        return ret
      }
      if (store.getters.isDomainMode) {
        const selfDomain = store.getters.userInfo.projectDomain
        const isSelfDomain = data.every(item => item.project_domain === selfDomain)
        if (isSelfDomain) {
          ret.validate = true
          return ret
        }
      }
      ret.validate = false
      return ret
    },
  }
  if (params.permission) options.permission = params.permission
  return options
}
