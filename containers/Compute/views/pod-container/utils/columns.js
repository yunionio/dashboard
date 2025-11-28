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
