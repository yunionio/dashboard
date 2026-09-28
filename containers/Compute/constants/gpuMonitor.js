import i18n from '@/locales'

/**
 * GPU / 加速卡监控 measurement：
 * - 裸金属：多数带 agent_ 前缀；昆仑芯后端约定为 xpusmi（无 agent_）
 * - 容器宿主机：与裸金属相同，去掉 agent_ 前缀
 */
export const GPU_VENDORS = [
  {
    key: 'nvidia',
    vendorLabel: () => i18n.t('compute.metric.gpu_vendor.nvidia'),
    groupBy: ['index'],
    baremetal: 'agent_nvidia_smi',
    host: 'nvidia_smi',
    matchers: [/nvidia/i],
    pciIds: ['10de'],
  },
  {
    key: 'ascend',
    vendorLabel: () => i18n.t('compute.metric.gpu_vendor.ascend'),
    groupBy: ['index'],
    baremetal: 'agent_npu_smi',
    host: 'npu_smi',
    matchers: [/ascend/i, /huawei/i, /昇腾/],
    pciIds: [],
  },
  {
    key: 'hygon',
    vendorLabel: () => i18n.t('compute.metric.gpu_vendor.hygon'),
    groupBy: ['dcu'],
    baremetal: 'agent_hysmi',
    host: 'hysmi',
    matchers: [/hygon/i, /海光/],
    pciIds: [],
  },
  {
    key: 'iluvatar',
    vendorLabel: () => i18n.t('compute.metric.gpu_vendor.iluvatar'),
    groupBy: ['index'],
    baremetal: 'agent_ixsmi',
    host: 'ixsmi',
    matchers: [/iluvatar/i, /ixsmi/i, /天数/],
    pciIds: [],
  },
  {
    key: 'ppu',
    vendorLabel: () => i18n.t('compute.metric.gpu_vendor.ppu'),
    groupBy: ['index'],
    baremetal: 'agent_ppusmi',
    host: 'ppusmi',
    matchers: [/ppu/i, /pingtouge/i, /平头哥/, /t-?head/i],
    pciIds: [],
  },
  {
    key: 'kunlun',
    vendorLabel: () => i18n.t('compute.metric.gpu_vendor.kunlun'),
    groupBy: ['index'],
    baremetal: 'xpusmi',
    host: 'xpusmi',
    matchers: [/kunlun/i, /xpu/i, /昆仑/],
    pciIds: [],
  },
]

const GPU_METRIC_FIELDS = [
  {
    name: 'utilization_gpu',
    seleteItem: 'utilization_gpu',
    metricLabel: () => i18n.t('compute.metric.gpu_field.utilization_gpu'),
    unit: '%',
  },
  {
    name: 'utilization_memory',
    seleteItem: 'utilization_memory',
    metricLabel: () => i18n.t('compute.metric.gpu_field.utilization_memory'),
    unit: '%',
  },
  {
    name: 'temperature_gpu',
    seleteItem: 'temperature_gpu',
    metricLabel: () => i18n.t('compute.metric.gpu_field.temperature_gpu'),
    unit: '℃',
  },
  {
    name: 'power_draw',
    seleteItem: 'power_draw',
    metricLabel: () => i18n.t('compute.metric.gpu_field.power_draw'),
    unit: 'W',
  },
]

export function resolveGpuVendorKey (device = {}) {
  const text = [device.vendor, device.model, device.dev_type].filter(Boolean).join(' ')
  const pciId = (device.vendor_device_id || '').split(':')[0]?.toLowerCase()
  for (let i = 0; i < GPU_VENDORS.length; i++) {
    const vendor = GPU_VENDORS[i]
    if (vendor.matchers.some(reg => reg.test(text))) {
      return vendor.key
    }
    if (pciId && vendor.pciIds.includes(pciId)) {
      return vendor.key
    }
  }
  return null
}

export function getGpuVendorKeysFromDevices (devices = []) {
  const keys = new Set()
  devices.forEach(device => {
    const key = resolveGpuVendorKey(device)
    if (key) keys.add(key)
  })
  return [...keys]
}

export function buildGpuMonitorOpts (measurementKey, vendorKeys) {
  const keySet = vendorKeys ? new Set(vendorKeys) : null
  return GPU_VENDORS.reduce((list, vendor) => {
    if (keySet && !keySet.has(vendor.key)) {
      return list
    }
    const fromItem = vendor[measurementKey]
    const vendorLabel = vendor.vendorLabel()
    GPU_METRIC_FIELDS.forEach(field => {
      const label = `${vendorLabel} ${field.metricLabel()}`
      list.push({
        name: `${vendor.key}_${field.name}`,
        label,
        as: label,
        seleteItem: field.seleteItem,
        fromItem,
        groupBy: vendor.groupBy,
        unit: field.unit,
        transfer: 1,
        vendorKey: vendor.key,
      })
    })
    return list
  }, [])
}
