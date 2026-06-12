import { getEnabledSwitchActions } from '@/utils/common/tableActions'

export function getAiproxyBatchEnabledActions (vm, resource, resourceName) {
  return getEnabledSwitchActions(vm, undefined, [`${resource}_perform_enable`, `${resource}_perform_disable`], {
    resourceName,
    metas: [
      () => {
        const isEnable = !!vm.list.selectedItems.find(item => item.enabled)
        return { validate: vm.list.selectedItems.length && !isEnable }
      },
      () => {
        const isDisable = !!vm.list.selectedItems.find(item => !item.enabled)
        return { validate: vm.list.selectedItems.length && !isDisable }
      },
    ],
  })
}

export function getAiproxyRowEnabledActions (vm, row, resource, resourceName) {
  return getEnabledSwitchActions(vm, row, [`${resource}_perform_enable`, `${resource}_perform_disable`], {
    resourceName,
  })
}
