import {
  getNameDescriptionTableColumn,
  getStatusTableColumn,
  getBrandTableColumn,
  getAccountTableColumn,
  getTimeTableColumn,
  getPublicScopeTableColumn,
  getProjectDomainTableColumn,
  getTagTableColumn,
} from '@/utils/common/tableColumn'

import i18n from '@/locales'

const Areas = {
  mainland: i18n.t('network.cdn.area.mainland'),
  overseas: i18n.t('network.cdn.area.overseas'),
  global: i18n.t('network.cdn.area.global'),
}

const ServiceTypes = {
  web: i18n.t('network.cdn.service_type.web'),
  download: i18n.t('network.cdn.service_type.download'),
  media: i18n.t('network.cdn.service_type.media'),
}

export const getAreaColumn = ({ field = 'area', title = i18n.t('network.cdn.area') } = {}) => {
  return {
    field,
    title,
    slots: {
      default: ({ row }, h) => {
        const area = row.area && row.area.toLowerCase()
        return Areas[area] || area || '-'
      },
    },
  }
}

export const getServiceTypeColumn = ({ field = 'service_type', title = i18n.t('network.cdn.service_type') } = {}) => {
  return {
    field,
    title,
    slots: {
      default: ({ row }, h) => {
        const serviceType = row.service_type && row.service_type.toLowerCase()
        return ServiceTypes[serviceType] || serviceType || '-'
      },
    },
  }
}

export const getCnameTableColumn = ({ field = 'cname', title = i18n.t('network.cdn.cname') } = {}) => {
  return {
    field,
    title,
    slots: {
      default: ({ row }, h) => {
        return row.cname || '-'
      },
    },
  }
}

export const getDomainTableColumn = ({ field = 'external_id', title = i18n.t('network.cdn.domain') } = {}) => {
  return {
    field,
    title,
    slots: {
      default: ({ row }, h) => {
        return row.external_id || '-'
      },
    },
  }
}

export default {
  created () {
    this.columns = [
      getNameDescriptionTableColumn({
        onManager: this.onManager,
        hideField: true,
        addLock: true,
        slotCallback: row => {
          return (
            <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
          )
        },
      }),
      getStatusTableColumn({ statusModule: 'cdnDomain' }),
      getTagTableColumn({ onManager: this.onManager, needExt: true, resource: 'cdn_domains', columns: () => this.columns }),
      getAreaColumn({}),
      getCnameTableColumn({}),
      getServiceTypeColumn({}),
      getBrandTableColumn(),
      getAccountTableColumn(),
      getPublicScopeTableColumn({ vm: this, resource: 'cdn_domains' }),
      getProjectDomainTableColumn(),
      getTimeTableColumn(),
    ]
  },
}
