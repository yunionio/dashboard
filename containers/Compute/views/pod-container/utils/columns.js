import i18n from '@/locales'
import { getCopyWithContentTableColumn } from '@/utils/common/tableColumn'

export const getImageTableColumn = () => {
  return getCopyWithContentTableColumn({
    title: i18n.t('compute.pod-image'),
    field: 'image',
    hideField: true,
    message: row => row.spec?.image,
    slotCallback: (row) => {
      return row.spec?.image || '-'
    },
  })
}

export const getEnvTableColumn = () => {
  return {
    field: 'env',
    title: i18n.t('compute.repo.env_variables'),
    minWidth: 200,
    slots: {
      default: ({ row }, h) => {
        if (!row.spec || !row.spec.envs || !row.spec.envs.length) return '-'
        return [<list-body-cell-popover text={i18n.t('cloudenv.text_245', [(row.spec.envs && row.spec.envs.length) || 0])} min-width="500px">
          <vxe-grid
            showOverflow={false}
            row-config={{ isHover: true }}
            column-config={{ resizable: false }}
            data={row.spec.envs}
            columns={[
              {
                field: 'key',
                title: i18n.t('common.name'),
                slots: {
                  default: ({ row }, h) => {
                    return row.key || '-'
                  },
                },
              },
              {
                field: 'value',
                title: i18n.t('compute.repo.value'),
                slots: {
                  default: ({ row }, h) => {
                    return row.value || '-'
                  },
                },
              },
            ]} />
        </list-body-cell-popover>]
      },
    },
    formatter: ({ row }) => {
      if (!row.spec || !row.spec.envs || !row.spec.envs.length) return '-'
      return row.spec.envs.map(v => {
        return `${v.key}: ${v.value || ''}`
      }).join(', ')
    },
  }
}

export const getCommandTableColumn = () => {
  return getCopyWithContentTableColumn({
    title: i18n.t('compute.repo.command'),
    field: 'command',
    hideField: true,
    message: row => {
      const command = row.spec?.command || []
      return command.join(' ') || ''
    },
    slotCallback: (row) => {
      const command = row.spec?.command || []
      return command.join(' ') || '-'
    },
  })
}

export const getArgsTableColumn = () => {
  return getCopyWithContentTableColumn({
    title: i18n.t('compute.repo.command.params'),
    field: 'args',
    hideField: true,
    message: row => {
      const args = row.spec?.args
      return args?.length ? `[${args}]` : ''
    },
    slotCallback: (row) => {
      const args = row.spec?.args
      return args?.length ? `[${args}]` : '-'
    },
  })
}

export const getCapabilitiesTableColumn = () => {
  return {
    field: 'capabilities',
    title: 'Capabilities',
    minWidth: 200,
    slots: {
      default: ({ row }, h) => {
        const caps = row.spec?.capabilities
        if (!caps) return '-'
        const tags = []
        if (caps.add?.length) {
          caps.add.forEach(cap => {
            tags.push(<a-tag color="blue" class="mb-1">+{cap}</a-tag>)
          })
        }
        if (caps.drop?.length) {
          caps.drop.forEach(cap => {
            tags.push(<a-tag color="red" class="mb-1">-{cap}</a-tag>)
          })
        }
        return tags.length ? tags : '-'
      },
    },
  }
}

export const getLxcfsTableColumn = () => {
  return {
    field: 'enable_lxcfs',
    title: i18n.t('compute.repo.enable_lxcfs'),
    width: 120,
    formatter: ({ row }) => {
      return row.spec?.enable_lxcfs ? i18n.t('status.enabled.true') : i18n.t('status.enabled.false')
    },
  }
}

export const getOverlayTableColumn = () => {
  return {
    field: 'overlay',
    title: i18n.t('compute.repo.enable_sys_disk_overlay'),
    width: 160,
    formatter: ({ row }) => {
      const hasOverlay = row.spec?.rootfs?.type === 'disk'
      return hasOverlay ? i18n.t('status.enabled.true') : i18n.t('status.enabled.false')
    },
  }
}
