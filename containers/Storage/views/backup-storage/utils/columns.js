import i18n from '@/locales'
import { sizestr } from '@/utils/utils'

export const getStorageTypeColumns = () => {
  return {
    field: 'storage_type',
    title: i18n.t('storage.text_38'),
    slots: {
      default: ({ row }) => {
        return row.storage_type
      },
    },
  }
}

export const getCapacityMbColumns = () => {
  return {
    field: 'capacity_mb',
    title: i18n.t('storage.capacity'),
    slots: {
      default: ({ row }) => {
        return sizestr(row.capacity_mb, 'M', 1024) || '-'
      },
    },
  }
}

export const getProjectDomainTableColumns = () => {
  return {
    field: 'project_domain',
    title: i18n.t('common.attribution_scope'),
    slots: {
      default: ({ row }, h) => {
        const ret = []
        const domain = row.project_domain
        if (domain) {
          ret.push(
            <list-body-cell-wrap hide-field copy field="domain" row={{ domain }}>
              <span>{ domain }</span>
            </list-body-cell-wrap>,
          )
        }
        return ret
      },
    },
  }
}
