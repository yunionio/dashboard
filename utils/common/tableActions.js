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
  const { name = '实例', scope, resource, apiVersion } = dialogParams
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
        resource,
        apiVersion,
      })
    },
    meta: row => {
      if (!store.getters.l3PermissionEnable && (scope === 'domain' || (store.getters.scopeResource && store.getters.scopeResource.domain.includes(resource)))) {
        return {
          validate: false,
          tooltip: '仅在开启三级权限的情况下支持此操作',
        }
      }
      if (params.meta) {
        return params.meta(row)
      }
      const data = getSelectedData(row, vm)
      const ret = {
        validate: data && data.length > 0,
        tooltip: null,
      }
      // 不管是否开启了三级权限都可以设置共享 -> luxiangjie
      // if (!store.getters.l3PermissionEnable) {
      //   ret.validate = false
      //   return ret
      // }
      // 如果是域资源则只有管理员可以设置
      if (scope === 'domain') {
        if (!store.getters.isAdminMode) {
          ret.validate = false
          return ret
        }
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

export function getEnabledSwitchActions (vm, row, permissions = [], params = {}) {
  if (!vm) {
    throw Error('not found vm instance')
  }
  const { resourceName = '', fields, actions, metas } = params
  const data = getSelectedData(row, vm)
  const openDialog = (rowItem, type, index) => {
    const { list = {} } = vm
    const { resource } = list
    const dialogParams = {
      fields,
      resourceName,
      vm,
      data,
      resource: vm.resource || resource,
      onManager: vm.onManager,
      refresh: vm.refresh,
      columns: vm.columns,
      action: type,
    }
    if (actions && actions.length > 0 && actions[index]) {
      dialogParams.onOk = () => actions[index](rowItem)
    }
    if (!dialogParams.data || dialogParams.data.length === 0) {
      dialogParams.data = [rowItem]
    }
    vm.createDialog('EnabledSwitchDialog', dialogParams)
  }
  const btns = ['enable', 'disable'].map((type, index) => {
    const _permissions = permissions || []
    return {
      permissions: _permissions[index],
      label: i18n.t('status.enabled')[type],
      action: (rowItem) => openDialog(rowItem, type, index),
      meta: (rowItem) => {
        if (metas && metas.length > 0) {
          const meta = metas[index]
          return meta && meta(rowItem)
        }
        const item = (data && data.length === 1) ? data[0] : rowItem
        // 批量选择1条，或者单个操作
        if (item) {
          const validate = index ? item.enabled : !item.enabled
          return {
            validate,
          }
        }
        // 批量N条操作
        return {
          validate: data.length > 0, // 批量数量大于0才可以操作
        }
      },
    }
  })
  return btns
}
