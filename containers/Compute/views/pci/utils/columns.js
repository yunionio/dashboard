import i18n from '@/locales'

// 设备类型
export const getDevTypeColumn = () => {
  return {
    field: 'dev_type',
    title: i18n.t('compute.pci.dev_type'),
    minWidth: 100,
    showOverflow: 'title',
    slots: {
      default: ({ row }, h) => {
        return row.dev_type
      },
    },
  }
}

// 设备型号
export const getModelColumn = () => {
  return {
    field: 'model',
    title: i18n.t('compute.pci.model'),
    minWidth: 100,
    showOverflow: 'title',
    slots: {
      default: ({ row }, h) => {
        return row.model
      },
    },
  }
}

// 设备VendorId
export const getVendorIdColumn = () => {
  return {
    field: 'vendor_id',
    title: i18n.t('compute.pci.vendor_id'),
    minWidth: 100,
    showOverflow: 'title',
    slots: {
      default: ({ row }, h) => {
        return row.vendor_id
      },
    },
  }
}

// 设备DeviceId
export const getDeviceIdColumn = () => {
  return {
    field: 'device_id',
    title: i18n.t('compute.pci.device_id'),
    minWidth: 100,
    showOverflow: 'title',
    slots: {
      default: ({ row }, h) => {
        return row.device_id
      },
    },
  }
}
