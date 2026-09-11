import { sizestr } from '@/utils/utils'
import i18n from '@/locales'
import { formatDevicesDisplay } from '@Ai/utils/deviceFormUtils'
import { getSkuModelDisplayText } from './modelDisplay'
import LlmSkuMountedModels from '../components/LlmSkuMountedModels.vue'

export { getSourceTableColumn } from './skuSourceDisplay'

export const getDeviceModelTableColumn = () => {
  return {
    field: 'device',
    title: i18n.t('aice.device'),
    minWidth: 120,
    slots: {
      default: ({ row }, h) => {
        const text = formatDevicesDisplay(row.devices, { fallbackMemoryMb: row.vram_claim_mb })
        if (text === '-') return '-'
        return text.split(', ').map(part => (
          h('div', { class: 'mb-1' }, [h('a-tag', [part])])
        ))
      },
    },
    formatter: ({ row }) => {
      return formatDevicesDisplay(row.devices, { fallbackMemoryMb: row.vram_claim_mb })
    },
  }
}

export const getVramClaimTableColumn = () => {
  return {
    field: 'vram_claim_mb',
    title: i18n.t('aice.vram_claim_mb'),
    width: 120,
    formatter: ({ row }) => {
      if (!row.vram_claim_mb) return '-'
      return `${row.vram_claim_mb} MB`
    },
  }
}

export const getEnvsTableColumn = () => {
  return {
    field: 'envs',
    title: i18n.t('aice.envs'),
    minWidth: 120,
    slots: {
      default: ({ row }, h) => {
        if (row.envs?.length) {
          return row.envs.map(v => {
            return h('div', { class: 'mb-1' }, [h('a-tag', [`${v.key}=${v.value}`])])
          })
        }
        return '-'
      },
    },
    formatter: ({ row }) => {
      if (row.envs?.length) {
        return row.envs.map(v => v.key).join(',')
      }
      return '-'
    },
  }
}

export const getAppNameTableColumn = () => {
  return {
    field: 'app_name',
    title: i18n.t('aice.llm_image.app_name'),
    width: 160,
    formatter: ({ row }) => {
      return row.app_name || '-'
    },
  }
}

export const getImageTableColumn = ({ vm = {} } = {}) => {
  return {
    field: 'image',
    title: i18n.t('aice.image'),
    width: 180,
    formatter: ({ row }) => {
      return row.image || '-'
    },
    slots: {
      default: ({ row }) => {
        if (!row.image) return '-'
        return [
          vm.$createElement('list-body-cell-wrap', {
            props: {
              copy: true,
              hideField: true,
              field: 'image',
              row,
              message: row.image,
            },
          }, [
            vm.$createElement('side-page-trigger', {
              props: {
                permission: 'llm_images_get',
                name: 'LlmImageSidePage',
                id: row.llm_image_id,
                vm,
              },
            }, [row.image]),
          ]),
        ]
      },
    },
  }
}

export const getBandwidthTableColumn = () => {
  return {
    field: 'bandwidth',
    title: i18n.t('aice.bandwidth'),
    width: 120,
    formatter: ({ row }) => {
      if (!row.bandwidth) return '-'
      if (row.bandwidth === 0) return `0(${i18n.t('common.not_limited')})`
      return `${row.bandwidth}M`
    },
  }
}

const formatCgroupLimit = (value) => {
  const status = value ? i18n.t('status.enabled.true') : i18n.t('status.enabled.false')
  return `${i18n.t('aice.enable_cgroup')}: ${status}`
}

export const getCpuTableColumn = (opts = {}) => {
  const { showCgroupLimit = false } = opts
  return {
    field: 'cpu',
    title: 'CPU',
    width: showCgroupLimit ? 220 : 120,
    sortable: true,
    slots: showCgroupLimit
      ? {
        default: ({ row }, h) => {
          return [
            h('span', [row.cpu]),
            h('span', { class: 'ml-3' }, [formatCgroupLimit(row.enable_cgroup_cpu)]),
          ]
        },
      }
      : undefined,
    formatter: ({ row }) => {
      if (showCgroupLimit) {
        return `${row.cpu} ${formatCgroupLimit(row.enable_cgroup_cpu)}`
      }
      return row.cpu
    },
  }
}

export const getMemoryTableColumn = (opts = {}) => {
  const { showCgroupLimit = false } = opts
  return {
    field: 'memory',
    title: i18n.t('aice.memory'),
    width: showCgroupLimit ? 220 : 120,
    slots: showCgroupLimit
      ? {
        default: ({ row }, h) => {
          return [
            h('span', [sizestr(row.memory, 'M', 1024)]),
            h('span', { class: 'ml-3' }, [formatCgroupLimit(row.enable_cgroup_memory)]),
          ]
        },
      }
      : undefined,
    formatter: ({ row }) => {
      const size = sizestr(row.memory, 'M', 1024)
      if (showCgroupLimit) {
        return `${size} ${formatCgroupLimit(row.enable_cgroup_memory)}`
      }
      return size
    },
  }
}

export const getDiskTableColumn = () => {
  return {
    field: 'volumes',
    title: i18n.t('aice.disk'),
    width: 120,
    formatter: ({ row }) => {
      let size = 0
      const volumes = row.volumes || []
      volumes.forEach(v => {
        size += v.size_mb
      })
      return sizestr(size, 'M', 1024)
    },
  }
}

export const getLlmTypeTableColumn = (opts = {}) => {
  const isApplyType = typeof opts === 'boolean' ? opts : opts.isApplyType
  const isDesktopType = typeof opts === 'object' ? opts.isDesktopType : false
  let title = i18n.t('aice.llm_type.llm')
  if (isDesktopType) title = i18n.t('aice.llm_type.desktop_type')
  else if (isApplyType) title = i18n.t('aice.llm_type.app')
  return {
    field: 'llm_type',
    title,
    formatter: ({ row }) => {
      return row.llm_type || '-'
    },
  }
}

export const getLlmModelNameTableColumn = ({ vm = {} } = {}) => {
  return {
    field: 'mounted_models',
    title: i18n.t('aice.llm_instantmodel.menu'),
    formatter: ({ row }) => {
      const text = getSkuModelDisplayText(row)
      return text || '-'
    },
    slots: {
      default: ({ row }) => {
        if (!row.mounted_model_details?.length && !getSkuModelDisplayText(row)) {
          return '-'
        }
        return [
          vm.$createElement(LlmSkuMountedModels, {
            props: { row, vm, showLabel: false },
          }),
        ]
      },
    },
  }
}

export const getNetworkTableColumn = () => {
  return {
    field: 'network',
    title: i18n.t('cloudenv.text_7'),
    formatter: ({ row }) => {
      return row.network || '-'
    },
  }
}

export const getNetworkTypeTableColumn = () => {
  return {
    field: 'network_type',
    title: i18n.t('common.network.type'),
    formatter: ({ row }) => {
      return i18n.t('networkServerType')[row.network_type] || '-'
    },
  }
}
