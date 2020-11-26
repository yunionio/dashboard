import {
  getCopyWithContentTableColumn,
  getRegionTableColumn,
  getAccountTableColumn,
  getPublicScopeTableColumn,
  getProjectDomainTableColumn,
  getBrandTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'

const routeType = {
  system: i18n.t('network.text_673'),
  custom: i18n.t('network.text_674'),
  bgp: i18n.t('network.text_675'),
  ip: i18n.t('network.text_674'),
  peering: i18n.t('network.text_676'),
}

const nextHopType = {
  Instance: i18n.t('network.text_677'),
  HaVip: i18n.t('network.text_678'),
  RouterInterface: i18n.t('network.text_679'),
  NetworkInterface: i18n.t('network.text_241'),
  VpnGateway: i18n.t('network.text_680'),
  IPv6Gateway: i18n.t('network.text_681'),
}

export default {
  created () {
    this.columns = [
      getCopyWithContentTableColumn(),
      {
        field: 'routes',
        title: i18n.t('network.text_672'),
        minWidth: 220,
        showOverflow: 'title',
        slots: {
          default: ({ row }, h) => {
            if (!row.routes || row.routes.length === 0) {
              return '-'
            }
            return [
              h('div', row.routes.map(route => {
                const { type, cidr, next_hop_type: next } = route
                let routeItem = ''
                if (type) routeItem += ` ${routeType[type.toLowerCase()] || type}`
                if (cidr) routeItem += ` ${cidr}`
                if (next) routeItem += ` ${nextHopType[next.toLowerCase()] || next}`
                return h('a-tag', {
                  class: 'text-truncate',
                  style: {
                    display: 'block',
                  },
                  props: {
                    size: 'mini',
                    type: 'info',
                  },
                }, routeItem)
              })),
            ]
          },
        },
      },
      {
        field: 'vpc',
        title: i18n.t('network.text_535'),
        minWidth: 120,
        showOverflow: 'ellipsis',
        hidden: () => this.hiddenColumns.includes('vpc'),
      },
      getBrandTableColumn({
        hidden: () => this.hiddenColumns.includes('brand'),
      }),
      getAccountTableColumn({
        hidden: () => this.hiddenColumns.includes('account'),
      }),
      getPublicScopeTableColumn({ vm: this, resource: 'routetables' }),
      getProjectDomainTableColumn(),
      getRegionTableColumn({
        hidden: () => this.hiddenColumns.includes('region'),
      }),
    ]
  },
}
