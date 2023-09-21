import i18n from '@/locales'

export const getTypeTableColumn = () => {
  return {
    field: 'type',
    title: i18n.t('k8s.text_34'),
    slots: {
      default: ({ row }, h) => {
        return row.type
      },
    },
  }
}

export const getUrlTableColumn = () => {
  return {
    field: 'url',
    title: i18n.t('k8s.repo.url'),
    minWidth: 240,
    slots: {
      default: ({ row }, h) => {
        return [
          <a-tooltip title={`${row.url}`}>
            <a-tag class="d-block text-truncate mb-1" style="max-width: 400px;">{row.url}</a-tag>
          </a-tooltip>,
        ]
      },
    },
  }
}
