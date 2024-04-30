import i18n from '@/locales'
import {
  getNameDescriptionTableColumn,
  getCopyWithContentTableColumn,
} from '@/utils/common/tableColumn'

// 设备类型
export const getDevTypeColumn = ({ vm }) => {
  return getNameDescriptionTableColumn({
    onManager: vm.onManager,
    hideField: true,
    showDesc: false,
    edit: false,
    title: i18n.t('compute.pci.dev_type'),
    field: 'dev_type',
    slotCallback: (row, h) => {
      return (
        <side-page-trigger onTrigger={() => vm.handleOpenSidepage(row)}>{row.dev_type}</side-page-trigger>
      )
    },
  })
}

// 设备型号
export const getModelColumn = () => {
  return getCopyWithContentTableColumn({
    field: 'model',
    title: i18n.t('compute.pci.model'),
  })
}

// 设备VendorId
export const getVendorIdColumn = () => {
  return getCopyWithContentTableColumn({
    field: 'vendor_id',
    title: i18n.t('compute.pci.vendor_id'),
  })
}

// 设备DeviceId
export const getDeviceIdColumn = () => {
  return getCopyWithContentTableColumn({
    field: 'device_id',
    title: i18n.t('compute.pci.device_id'),
  })
}

// 是否开启热插拔
export const getHotPluggableColumn = () => {
  return {
    field: 'hot_pluggable',
    title: i18n.t('compute.pci.hot_pluggable'),
    slots: {
      default: ({ row }, h) => {
        return row.hot_pluggable ? i18n.t('table.title.on') : i18n.t('table.title.off')
      },
    },
  }
}

// 自动探测
export const getDisableAutoDetectColumn = () => {
  return {
    field: 'disable_auto_detect',
    title: i18n.t('compute.pci.disable_auto_detect'),
    slots: {
      default: ({ row }, h) => {
        return row.disable_auto_detect ? i18n.t('table.title.on') : i18n.t('table.title.off')
      },
    },
  }
}
