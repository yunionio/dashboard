<template>
  <detail
    :data="data"
    :onManager="onManager"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    status-module="waf" />
</template>

<script>
import _ from 'lodash'
import i18n from '@/locales'
import WindowsMixin from '@/mixins/windows'
import {
  getBrandTableColumn,
  getRegionTableColumn,
} from '@/utils/common/tableColumn'

import {
  getUserTagColumn,
  getExtTagColumn,
} from '@/utils/common/detailColumn'

export default {
  name: 'WafInstanceDetail',
  mixins: [WindowsMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        getUserTagColumn({ onManager: this.onManager, resource: 'waf_instance', columns: () => this.columns, tipName: this.$t('network.waf') }),
        getExtTagColumn({ onManager: this.onManager, resource: 'waf_instance', columns: () => this.columns, tipName: this.$t('network.waf') }),
        {
          field: 'type',
          title: i18n.t('network.waf.type'),
          slots: {
            default: ({ row }) => {
              const ret = []
              const type = this.$getI18n(`network.waf.type.${row.type}`, row.type)
              ret.push(<div>{type}</div>)
              if (row.brand === 'Qcloud') {
                ret.push(<list-body-cell-wrap hide-field copy field="cname" row={row}>
                  <span class='text-weak'>{row.cname}</span>
                </list-body-cell-wrap>)
              }
              return ret
            },
          },
        },
        {
          field: 'action',
          title: i18n.t('network.waf.action_default'),
          formatter: ({ row }) => {
            const action = _.get(row, ['action', 'action']) || _.get(this.data, 'default_action.action')
            if (action) return i18n.t(`network.waf.rule_action_${action}`)
            return '-'
          },
        },
        getBrandTableColumn(),
        getRegionTableColumn(),
        {
          title: i18n.t('network.text_196'),
          field: 'account',
          slots: {
            default: ({ row }) => {
              return <list-body-cell-wrap hide-field copy field={'account'} row={row}>
                <side-page-trigger permission='cloudaccounts_get' name='CloudaccountSidePage' id={row.account_id} vm={this}>{ row.account }</side-page-trigger>
              </list-body-cell-wrap>
            },
          },
        },
        {
          title: i18n.t('network.waf.manager'),
          field: 'manager',
          slots: {
            default: ({ row }) => {
              return <list-body-cell-wrap hide-field copy field={'manager'} row={row}>
                <side-page-trigger permission='cloudproviders_get' name='CloudproviderSidePage' id={row.manager_id} vm={this}>{ row.account }</side-page-trigger>
              </list-body-cell-wrap>
            },
          },
        },
      ],
      extraInfo: [
        {
          title: this.$t('network.domain_info'),
          items: [
            {
              field: 'port',
              title: this.$t('network.protocol_port'),
              slots: {
                default: ({ row }) => {
                  const ret = []
                  if (row.http_ports && row.http_ports.length) {
                    ret.push(<div class="mb-2"><a-tag color='blue'>HTTP: { row.http_ports.join('、') }</a-tag></div>)
                  }
                  if (row.https_ports && row.https_ports.length) {
                    ret.push(<div><a-tag color='blue'>HTTPS: { row.https_ports.join('、') }</a-tag></div>)
                  }
                  return ret.length ? ret : '-'
                },
              },
            },
            {
              field: 'upstream_scheme',
              title: this.$t('network.upstream_scheme'),
              formatter: ({ row }) => {
                return row.upstream_scheme || '-'
              },
            },
            {
              field: 'upstream_port',
              title: this.$t('network.upstream_port'),
              formatter: ({ row }) => {
                return row.upstream_port || '-'
              },
            },
            {
              field: 'source_ips',
              title: this.$t('network.source_ips'),
              slots: {
                default: ({ row }) => {
                  if (row.source_ips && row.source_ips.length) {
                    const ret = []
                    row.source_ips.map(item => {
                      ret.push(<list-body-cell-wrap hide-field copy field="ip" row={{ ip: item }}>
                        <span>{item}</span>
                      </list-body-cell-wrap>)
                    })
                    return ret
                  }
                  return '-'
                },
              },
            },
          ],
        },
      ],
    }
  },
  computed: {
  },
}
</script>
