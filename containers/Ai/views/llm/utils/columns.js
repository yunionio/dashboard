import i18n from '@/locales'
import { sizestr } from '@/utils/utils'
import { getCopyWithContentTableColumn } from '@/utils/common/tableColumn'

export const getLlmIpColumn = () => {
  return {
    field: 'llm_ip',
    title: 'IP',
    width: 150,
    sortable: true,
    slots: {
      default: ({ row }, h) => {
        if (!row.llm_ip) return '-'
        const ip = row.llm_ip
        return [
          <list-body-cell-wrap copy row={{ ip }} hide-field field="ip">{ip}</list-body-cell-wrap>,
        ]
      },
    },
    formatter: ({ row }) => {
      return row.llm_ip || '-'
    },
  }
}

export const getLlmSkuColumn = ({ vm = {} } = {}) => {
  return {
    field: 'llm_sku',
    title: i18n.t('aice.llm_sku'),
    width: 120,
    slots: {
      default: ({ row }, h) => {
        const text = row.llm_sku || '-'
        return [
          <list-body-cell-wrap copy hideField={true} field='llm_sku' row={row} message={text}>
            <side-page-trigger permission='llm_skus_get' name='LlmSkuSidePage' id={row.llm_sku_id} vm={vm}>{text}</side-page-trigger>
          </list-body-cell-wrap>,
        ]
      },
    },
    formatter: ({ row }) => {
      return row.llm_sku || '-'
    },
  }
}

export const getLlmImageColumn = ({ vm = {} } = {}) => {
  return {
    field: 'llm_image',
    title: i18n.t('aice.image'),
    width: 120,
    slots: {
      default: ({ row }, h) => {
        const text = row.llm_image || '-'
        return [
          <list-body-cell-wrap copy hideField={true} field='llm_image' row={row} message={text}>
            <side-page-trigger permission='llm_images_get' name='LlmImageSidePage' id={row.llm_image_id} vm={vm}>{text}</side-page-trigger>
          </list-body-cell-wrap>,
        ]
      },
    },
    formatter: ({ row }) => {
      return row.llm_image || '-'
    },
  }
}

export const getCpuTableColumn = () => {
  return {
    field: 'vcpu_count',
    title: 'CPU',
    width: 120,
    sortable: true,
    formatter: ({ row }) => {
      return row.vcpu_count || 0
    },
  }
}

export const getMemoryTableColumn = () => {
  return {
    field: 'vmem_size_mb',
    title: i18n.t('aice.memory'),
    width: 120,
    formatter: ({ row }) => {
      return sizestr(row.vmem_size_mb, 'M', 1024)
    },
  }
}

export const getDiskTableColumn = () => {
  return {
    field: 'volume',
    title: i18n.t('aice.disk'),
    width: 120,
    formatter: ({ row }) => {
      return sizestr(row.volume?.size_mb, 'M', 1024)
    },
  }
}

export const getBandwidthTableColumn = () => {
  return {
    field: 'bandwidth_mb',
    title: i18n.t('aice.bandwidth'),
    width: 120,
    formatter: ({ row }) => {
      if (row.bandwidth_mb === 0) return `0(${i18n.t('common.not_limited')})`
      return `${row.bandwidth_mb || 0}M`
    },
  }
}

export const getEffectBandwidthMbpsTableColumn = () => {
  return {
    field: 'effect_bandwidth_mbps',
    title: i18n.t('scope.cloudgame.effect_bandwidth_mbps'),
    width: 120,
    formatter: ({ row }) => {
      return row.effect_bandwidth_mbps || 0
    },
  }
}

export const getHostTableColumn = (vm) => {
  return {
    field: 'host',
    title: i18n.t('dictionary.host'),
    width: 120,
    slots: {
      default: ({ row }, h) => {
        return [
          <side-page-trigger permission='hosts_get' name='HostSidePage' id={row.host_id} vm={vm}>{row.host}</side-page-trigger>,
        ]
      },
    },
  }
}

export const getImageTableColumn = () => {
  return {
    field: 'image_name',
    title: i18n.t('scope.cloudgame.image'),
    width: 120,
    formatter: ({ row }) => {
      return row.image_name
    },
  }
}

export const getAppImageTableColumn = (vm) => {
  return {
    field: 'app_image',
    title: 'App Image',
    width: 120,
    slots: {
      default: ({ row }, h) => {
        return row.app_image || '-'
        // return [
        //   <side-page-trigger permission='hosts_get' name='AppImageSidePage' id={row.app_image_id} vm={vm} tab="host-detail">{row.app_image}</side-page-trigger>,
        // ]
      },
    },
  }
}

export const getDeskopIpTableColumn = () => {
  return getCopyWithContentTableColumn({ field: 'desktop_ip', title: 'IP' })
}

export const getStreamEndpointColumn = (endpoint) => {
  return getCopyWithContentTableColumn({
    field: 'endpoint',
    title: i18n.t('scope.stream_endpoint'),
    message: endpoint,
    hideField: true,
    slotCallback: (row) => {
      return endpoint || '-'
    },
  })
}

export const getPortsColumn = (ports) => {
  return {
    title: i18n.t('scope.cloudgame.access_info'),
    field: 'access_info',
    slots: {
      default: ({ row }, h) => {
        if (!ports.length) return '-'
        const cls = [
          {
            title: i18n.t('scope.cloudgame.access_info.protocol'),
            field: 'protocol',
            formatter: ({ row }) => {
              if (!row.protocol) return '-'
              return row.protocol.toUpperCase()
            },
          },
          {
            title: i18n.t('scope.cloudgame.access_info.desktop_ip'),
            field: 'desktop_ip',
            slots: {
              default: ({ row }, h) => {
                return [
                  <list-body-cell-wrap copy row={{ row }} hide-field field="desktop_ip">{row.desktop_ip}</list-body-cell-wrap>,
                ]
              },
            },
          },
          {
            title: i18n.t('scope.cloudgame.access_info.listen_port'),
            field: 'listen_port',
          },
          {
            title: i18n.t('scope.cloudgame.access_info.server_ip'),
            field: 'server_ip',
            slots: {
              default: ({ row }, h) => {
                return [
                  <list-body-cell-wrap copy row={{ row }} hide-field field="server_ip">{row.server_ip}</list-body-cell-wrap>,
                  <list-body-cell-wrap copy row={{ row }} hide-field field="public_ip">{row.public_ip}</list-body-cell-wrap>,
                ]
              },
            },
          },
          {
            title: i18n.t('scope.cloudgame.access_info.access_port'),
            field: 'access_port',
          },
          {
            title: i18n.t('scope.cloudgame.access_info.port_mapping_envs'),
            field: 'port_mapping_envs',
            formatter: ({ row }) => {
              return row.port_mapping_envs.map(item => `${item.key}:${item.value_from}`).join(',')
            },
          },
        ]
        return <vxe-grid data={ports || []} columns={cls}></vxe-grid>
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
