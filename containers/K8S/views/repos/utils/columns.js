import i18n from '@/locales'
import router from '@/router'

export const getTypeTableColumn = () => {
  return {
    field: 'type',
    title: i18n.t('k8s.text_34'),
    slots: {
      default: ({ row }, h) => {
        const typeMap = {
          common: i18n.t('k8s.repo.type.common'),
          custom: i18n.t('k8s.repo.type.custom'),
          harbor: 'Harbor',
        }
        return typeMap[row.type] || row.type
      },
    },
  }
}

export const getCredentialTableColumn = () => {
  return {
    field: 'credential_id',
    title: i18n.t('k8s.repo.credential'),
    minWidth: 100,
    slots: {
      default: ({ row }, h) => {
        if (row.credential_id) {
          return [<a-tag color="green" style="cursor: pointer;" onClick={() => router.push(`/credentials/?type=container_image&id=${row.credential_id}`)}>{row.credential_id}</a-tag>]
        }
        return [<a-tag>{i18n.t('k8s.repo.credential.none')}</a-tag>]
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
