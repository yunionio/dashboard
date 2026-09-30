import i18n from '@/locales'

const pct = name => ({
  name,
  seleteItem: name,
  metricLabel: () => i18n.t(`compute.metric.gpu_field.${name}`),
  unit: '%',
  transfer: 1,
})

const temp = (name, labelKey = name) => ({
  name,
  seleteItem: name,
  metricLabel: () => i18n.t(`compute.metric.gpu_field.${labelKey}`),
  unit: '℃',
  transfer: 1,
})

const watt = (name, labelKey = name) => ({
  name,
  seleteItem: name,
  metricLabel: () => i18n.t(`compute.metric.gpu_field.${labelKey}`),
  unit: 'W',
  transfer: 1,
})

const mhz = name => ({
  name,
  seleteItem: name,
  metricLabel: () => i18n.t(`compute.metric.gpu_field.${name}`),
  unit: 'MHz',
  transfer: 1,
})

const plain = (name, labelKey = name) => ({
  name,
  seleteItem: name,
  metricLabel: () => i18n.t(`compute.metric.gpu_field.${labelKey}`),
  unit: '',
  transfer: 1,
})

const memoryGroup = (prefix, labelKey) => ({
  name: prefix,
  seleteItem: `${prefix}_total,${prefix}_free,${prefix}_used`,
  metricLabel: () => i18n.t(`compute.metric.gpu_field.${labelKey}`),
  seriesLabels: () => [
    i18n.t('compute.metric.gpu_field.memory_total'),
    i18n.t('compute.metric.gpu_field.memory_free'),
    i18n.t('compute.metric.gpu_field.memory_used'),
  ],
  unit: 'M',
  transfer: 1024,
})

const sizeField = (name, labelKey = name) => ({
  name,
  seleteItem: name,
  metricLabel: () => i18n.t(`compute.metric.gpu_field.${labelKey}`),
  unit: 'M',
  transfer: 1024,
})

/**
 * GPU / 加速卡监控 measurement：
 * - 裸金属 / 虚拟机 Agent：多数带 agent_ 前缀；昆仑芯后端约定为 xpusmi（无 agent_）
 * - 容器宿主机：与裸金属相同，去掉 agent_ 前缀
 * fields 与后端各卡 Metrics 对齐，按厂商全量展示
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
    fields: [
      mhz('clocks_current_graphics'),
      mhz('clocks_current_memory'),
      temp('temperature_gpu'),
      memoryGroup('memory', 'memory'),
      pct('utilization_gpu'),
      pct('utilization_memory'),
    ],
  },
  {
    key: 'ascend',
    vendorLabel: () => i18n.t('compute.metric.gpu_vendor.ascend'),
    groupBy: ['index'],
    baremetal: 'agent_npu_smi',
    host: 'npu_smi',
    matchers: [/ascend/i, /huawei/i, /昇腾/],
    pciIds: [],
    fields: [
      temp('temperature', 'temperature'),
      watt('npu_real_time_power'),
      pct('npu_utilization'),
      pct('hbm_usage_rate'),
      sizeField('hbm_capacity'),
      pct('aicore_usage_rate'),
      pct('aivector_usage_rate'),
      pct('aicube_usage_rate'),
      pct('aicpu_usage_rate'),
      pct('hbm_bandwidth_usage_rate'),
    ],
  },
  {
    key: 'hygon',
    vendorLabel: () => i18n.t('compute.metric.gpu_vendor.hygon'),
    groupBy: ['index'],
    baremetal: 'agent_hysmi',
    host: 'hysmi',
    matchers: [/hygon/i, /海光/],
    pciIds: [],
    fields: [
      temp('temperature_gpu'),
      watt('power_draw'),
      watt('power_cap'),
      pct('utilization_gpu'),
      pct('utilization_memory'),
      pct('utilization_encoder'),
      pct('utilization_decoder'),
      memoryGroup('memory', 'memory'),
      memoryGroup('memory_gtt', 'memory_gtt'),
      memoryGroup('memory_vis_vram', 'memory_vis_vram'),
    ],
  },
  {
    key: 'iluvatar',
    vendorLabel: () => i18n.t('compute.metric.gpu_vendor.iluvatar'),
    groupBy: ['index'],
    baremetal: 'agent_ixsmi',
    host: 'ixsmi',
    matchers: [/iluvatar/i, /ixsmi/i, /天数/],
    pciIds: [],
    fields: [
      temp('temperature_gpu'),
      temp('temperature_memory'),
      memoryGroup('memory', 'memory'),
      pct('utilization_gpu'),
      pct('utilization_memory'),
      watt('power_draw'),
      mhz('clocks_current_sm'),
      mhz('clocks_current_memory'),
    ],
  },
  {
    key: 'ppu',
    vendorLabel: () => i18n.t('compute.metric.gpu_vendor.ppu'),
    groupBy: ['index'],
    baremetal: 'agent_ppusmi',
    host: 'ppusmi',
    matchers: [/ppu/i, /pingtouge/i, /平头哥/, /t-?head/i],
    pciIds: [],
    fields: [
      temp('temperature_gpu'),
      temp('temperature_memory'),
      memoryGroup('memory', 'memory'),
      pct('utilization_gpu'),
      pct('utilization_memory'),
      watt('power_draw'),
      mhz('clocks_current_sm'),
      mhz('clocks_current_memory'),
    ],
  },
  {
    key: 'kunlun',
    vendorLabel: () => i18n.t('compute.metric.gpu_vendor.kunlun'),
    groupBy: ['index'],
    baremetal: 'xpusmi',
    host: 'xpusmi',
    matchers: [/kunlun/i, /xpu/i, /昆仑/],
    pciIds: [],
    fields: [
      temp('temperature_gpu'),
      memoryGroup('memory', 'memory'),
      memoryGroup('l3_memory', 'l3_memory'),
      pct('utilization_gpu'),
      watt('power_draw'),
      watt('power_limit'),
      mhz('clocks_current_cluster'),
      mhz('clocks_current_cdnn'),
      plain('pcie_link_gen_current'),
      plain('pcie_link_width_current'),
      plain('ecc_errors_dram_correctable'),
      plain('ecc_errors_dram_uncorrectable'),
      plain('ecc_errors_dram_correctable_aggregate'),
      plain('ecc_errors_dram_uncorrectable_aggregate'),
    ],
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
    const fields = vendor.fields || []
    fields.forEach(field => {
      const label = `${vendorLabel} ${field.metricLabel()}`
      const seriesLabels = typeof field.seriesLabels === 'function' ? field.seriesLabels() : null
      const as = seriesLabels?.length
        ? seriesLabels.map(l => `${vendorLabel} ${l}`).join(',')
        : label
      list.push({
        name: `${vendor.key}_${field.name}`,
        label,
        as,
        seleteItem: field.seleteItem,
        fromItem,
        groupBy: vendor.groupBy,
        unit: field.unit,
        transfer: field.transfer ?? 1,
        vendorKey: vendor.key,
      })
    })
    return list
  }, [])
}
