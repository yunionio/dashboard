import i18n from '@/locales'
import { HYPERVISORS_MAP } from '@/constants'

// 合并二层网络
export function getWiresMergeAction (vm, dialogParams = {}, params = {}) {
  if (!vm) {
    throw Error('not found vm instance')
  }
  const { name = i18n.t('common_92'), scope, resource } = dialogParams
  const options = {
    label: i18n.t('network.wire.merge'),
    action: row => {
      vm.createDialog('WireMergeDialog', {
        vm,
        name,
        data: (vm.list && vm.list.selectedItems) || [],
        dataLoader: vm.getHostDetails,
        onManager: vm.onManager,
        refresh: vm.refresh,
        columns: vm.columns,
        expandConfig: vm.expandConfig,
        scope,
        resource,
      })
    },
    meta: row => {
      const data = (vm.list && vm.list.selectedItems) || []
      if (data.length < 2) {
        return {
          validate: false,
          tooltip: i18n.t('common.select.rows.limit', [2]),
        }
      }

      for (const item of data) {
        if (!vm.isPower(item)) {
          return {
            validate: false,
            tooltip: (i18n.t('common_716') + ': ' + item.name),
          }
        }

        if (item.provider.toLowerCase() !== HYPERVISORS_MAP.kvm.provider.toLowerCase()) {
          return {
            validate: false,
            tooltip: i18n.t('network.text_309', [item.provider]),
          }
        }
      }

      return {
        validate: true,
        tooltip: null,
      }
    },
  }
  if (params.permission) options.permission = params.permission
  if (params.hidden) options.hidden = params.hidden
  return options
}
