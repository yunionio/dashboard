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

export const getImageTableColumn = ({ vm = {} } = {}) => {
  return {
    field: 'image',
    title: i18n.t('aice.image'),
    width: 180,
    formatter: ({ row }) => {
      return row.image || '-'
    },
    slots: {
      default: ({ row }, h) => {
        return [
          <list-body-cell-wrap copy hideField={true} field='image' row={row} message={row.image}>
            <side-page-trigger permission='llm_images_get' name='LlmImageSidePage' id={row.llm_image_id} vm={vm}>{row.image}</side-page-trigger>
          </list-body-cell-wrap>,
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

export const getLlmModelNameTableColumn = ({ vm = {} } = {}) => {
  return {
    field: 'mounted_models',
    title: i18n.t('aice.model'),
    formatter: ({ row }) => {
      if (row.mounted_model_details && row.mounted_model_details.length) {
        return row.mounted_model_details.map(v => v.fullname).join(',')
      }
      return '-'
    },
    slots: {
      default: ({ row }, h) => {
        if (row.mounted_model_details && row.mounted_model_details.length) {
          const ret = []
          row.mounted_model_details.forEach(v => {
            ret.push(
              <list-body-cell-wrap copy hideField={true} field='id' row={v} message={v.fullname}>
                <side-page-trigger permission='llm_instant_models_get' name='LlmInstantModelSidePage' id={v.id} vm={vm}>{v.fullname}</side-page-trigger>
              </list-body-cell-wrap>,
            )
          })
          return ret
        }
        return '-'
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
