import i18n from '@/locales'

export const getImageTableColumn = () => {
  return {
    field: 'image',
    title: i18n.t('compute.pod-image'),
    width: 350,
    formatter: ({ row }) => {
      return row.spec?.image || '-'
    },
  }
}

export const getEnvTableColumn = () => {
  return {
    field: 'env',
    title: i18n.t('compute.repo.env_variables'),
    minWidth: 200,
    slots: {
      default: ({ row }, h) => {
        if (!row.spec.envs || !row.spec.envs.length) return '-'
        return row.spec.envs.map(v => {
          return (
            <a-tooltip title={`${v.key}: ${v.value}`}>
              <a-tag class="d-block text-truncate mb-1" style="max-width: 400px;">{v.key}: {v.value}</a-tag>
            </a-tooltip>
          )
        })
      },
    },
  }
}

export const getCommandTableColumn = () => {
  return {
    field: 'command',
    title: i18n.t('compute.repo.command'),
    minWidth: 200,
    slots: {
      default: ({ row }, h) => {
        const command = row.spec?.command || []
        return command.join(' ') || '-'
      },
    },
  }
}

export const getArgsTableColumn = () => {
  return {
    field: 'args',
    title: i18n.t('compute.repo.command.params'),
    minWidth: 200,
    slots: {
      default: ({ row }, h) => {
        const args = row.spec?.args
        return args?.length ? `[${args}]` : '-'
      },
    },
  }
}
