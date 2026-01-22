import { sizestr } from '@/utils/utils'
import i18n from '@/locales'

export const getDeviceModelTableColumn = () => {
  return {
    field: 'device',
    title: i18n.t('aice.device'),
    minWidth: 120,
    slots: {
      default: ({ row }, h) => {
        const devices = row.devices
        if (devices?.length) {
          return devices.map(v => {
            return <div class={'mb-1'}><a-tag>{v.model}</a-tag></div>
          })
        }
        return '-'
      },
    },
    formatter: ({ row }) => {
      const devices = row.devices
      if (devices?.length) {
        return devices.map(v => v.model).join(',')
      }
      return '-'
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
            return <div class={'mb-1'}><a-tag>{v.key}={v.value}</a-tag></div>
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

export const getImageTableColumn = () => {
  return {
    field: 'image',
    title: i18n.t('aice.image'),
    width: 180,
    formatter: ({ row }) => {
      return row.image || '-'
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

export const getCpuTableColumn = () => {
  return {
    field: 'cpu',
    title: 'CPU',
    width: 120,
    sortable: true,
    formatter: ({ row }) => {
      return row.cpu
    },
  }
}

export const getMemoryTableColumn = () => {
  return {
    field: 'memory',
    title: i18n.t('aice.memory'),
    width: 120,
    formatter: ({ row }) => {
      return sizestr(row.memory, 'M', 1024)
    },
  }
}

export const getDiskTableColumn = () => {
  return {
    field: 'disk',
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

export const getLlmTypeTableColumn = () => {
  return {
    field: 'llm_type',
    title: i18n.t('aice.llm_type'),
    formatter: ({ row }) => {
      return row.llm_type || '-'
    },
  }
}

export const getLlmModelNameTableColumn = () => {
  return {
    field: 'llm_model_name',
    title: i18n.t('aice.model_name'),
    formatter: ({ row }) => {
      return row.llm_model_name || '-'
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
