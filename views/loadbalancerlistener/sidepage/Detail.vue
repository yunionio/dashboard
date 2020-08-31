<template>
  <detail
    :on-manager="onManager"
    :data="data"
    statusModule="lb"
    :base-info="baseInfo"
    :extra-info="extraInfo" />
</template>

<script>
import * as R from 'ramda'
import { getCopyWithContentTableColumn, getBrandTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'LoadbalancerListenerDetail',
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
        getBrandTableColumn(),
      ],
      extraInfo: [
        {
          title: this.$t('network.text_308'),
          items: [
            {
              field: 'listener_type/listener_port',
              title: this.$t('network.text_477'),
              formatter: ({ row }) => {
                return `${row.listener_type.toUpperCase()}: ${row.listener_port}`
              },
            },
            getCopyWithContentTableColumn({
              field: 'loadbalancer',
              title: this.$t('network.text_137'),
              hideField: true,
              slotCallback: row => {
                if (!row.loadbalancer) return '-'
                return [
                  <side-page-trigger permission='lb_loadbalancers_get' name='LbSidePage' id={row.loadbalancer_id} vm={this}>{ row.loadbalancer }</side-page-trigger>,
                ]
              },
            }),
            getCopyWithContentTableColumn({
              field: 'backend_group',
              title: this.$t('network.text_139'),
              hideField: true,
              slotCallback: row => {
                if (this.isRedirect) return '-'
                if (!row.backend_group) return '-'
                return [
                  <side-page-trigger name='LoadbalancerbackendgroupSidePage' id={row.backend_group_id} vm={this}>{ row.backend_group }</side-page-trigger>,
                ]
              },
            }),
            getCopyWithContentTableColumn({
              field: 'certificate',
              title: this.$t('network.text_143'),
              hideField: true,
              slotCallback: row => {
                if (this.isRedirect) return '-'
                if (!row.certificate) return '-'
                return [
                  <side-page-trigger name='LbcertSidePage' id={row.certificate_id} vm={this}>{ row.certificate }</side-page-trigger>,
                ]
              },
            }),
          ],
        },
        {
          title: this.$t('network.text_478'),
          items: [
            {
              field: 'sticky_session',
              title: this.$t('network.text_423'),
              formatter: ({ row }) => {
                return this.isRedirect ? '-' : this.$t('schedulerTypeOpts')[row.scheduler]
              },
            },
            {
              field: 'sticky_session',
              title: this.$t('network.text_479'),
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                if (row.sticky_session === 'off') return this.$t('network.text_480')
                return this.$t('network.text_481')
              },
            },
            {
              field: 'sticky_session_type',
              title: this.$t('network.text_380'),
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                if (row.sticky_session_type === 'insert') return this.$t('network.text_384')
                else if (row.sticky_session_type === 'server') return this.$t('network.text_385')
                else return '-'
              },
            },
            {
              field: 'sticky_session_cookie',
              title: this.$t('network.text_381'),
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                if (row.sticky_session_type === 'insert') return this.$t('network.text_384')
                else if (row.sticky_session_type === 'server') return this.$t('network.text_385')
                else return '-'
              },
            },
            {
              field: 'sticky_session_cookie_timeout',
              title: this.$t('network.text_383'),
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return this.$t('network.text_188', [row.sticky_session_cookie_timeout])
              },
            },
            {
              field: 'acl_type',
              title: this.$t('network.text_142'),
              formatter: ({ row }) => {
                if (row.acl_status === 'on') {
                  return [
                    <div>{row.acl_type === 'white' ? this.$t('network.text_482') : this.$t('network.text_483')} （<side-page-trigger permission='lb_loadbalanceracls_get' name='LbaclSidePage' id={row.acl_id} vm={this}>{ row.acl }</side-page-trigger>）</div>,
                  ]
                }
                return this.$t('network.text_480')
              },
            },
            {
              field: 'redirect',
              title: this.$t('network.text_368'),
              formatter: ({ row }) => {
                return row.redirect === 'raw' ? this.$t('network.text_481') : this.$t('network.text_480')
              },
            },
            {
              field: 'redirect_code',
              title: this.$t('network.text_369'),
              formatter: ({ row }) => {
                if (row.redirect !== 'raw') return '-'
                return this.$t('redirect_code')[row.redirect_code] ? this.$t('redirect_code')[row.redirect_code].name : '-'
              },
            },
            {
              field: 'redirect_scheme',
              title: this.$t('network.text_370'),
              formatter: ({ row }) => {
                if (row.redirect !== 'raw') return '-'
                return [row.redirect_scheme, row.redirect_host, row.redirect_path].filter(item => !!item).join('、')
              },
            },
            {
              field: 'backend_connect_timeout',
              title: this.$t('network.text_435'),
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                if (row.provider.toUpperCase() !== 'onecloud') return '-'
                return row.backend_connect_timeout + this.$t('network.text_76')
              },
            },
            {
              field: 'backend_idle_timeout',
              title: this.$t('network.text_436'),
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                if (row.provider.toUpperCase() !== 'onecloud') return '-'
                return row.backend_idle_timeout + this.$t('network.text_76')
              },
            },
            {
              field: 'client_idle_timeout',
              title: this.$t('network.text_424'),
              formatter: ({ row }) => {
                return row.client_idle_timeout + this.$t('network.text_76')
              },
            },
            {
              field: 'client_request_timeout',
              title: this.$t('network.text_425'),
              formatter: ({ row }) => {
                return row.client_request_timeout + this.$t('network.text_76')
              },
            },
            {
              field: 'http_request_rate',
              title: this.$t('network.text_437'),
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                if (row.provider.toUpperCase() !== 'onecloud') return '-'
                return row.http_request_rate + this.$t('network.text_76')
              },
            },
            {
              field: 'http_request_rate_per_src',
              title: this.$t('network.text_440'),
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                if (row.provider.toUpperCase() !== 'onecloud') return '-'
                return row.http_request_rate_per_src + this.$t('network.text_76')
              },
            },
            {
              field: 'enable_http2',
              title: 'HTTP2.0',
              formatter: ({ row }) => {
                return row.enable_http2 ? this.$t('network.text_481') : this.$t('network.text_480')
              },
            },
            {
              field: 'gzip',
              title: this.$t('network.text_427'),
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return row.gzip ? this.$t('network.text_481') : this.$t('network.text_480')
              },
            },
            {
              field: 'xforwarded_for',
              title: this.$t('network.text_428'),
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                if (row.xforwarded_for || row.send_proxy !== 'off') {
                  return this.$t('network.text_481')
                }
                return this.$t('network.text_480')
              },
            },
            {
              field: 'egress_mbps',
              title: this.$t('network.text_484'),
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                if (row.egress_mbps === 0) return this.$t('network.text_485')
                if (R.is(Number, row.egress_mbps)) return `${row.egress_mbps} Mbps`
                return '-'
              },
            },
            {
              field: 'send_proxy',
              title: this.$t('network.text_442'),
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return this.$t('listenerProxyOpts')[row.send_proxy]
              },
            },
            {
              field: 'client_request_timeout',
              title: this.$t('network.text_444'),
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return row.xforwarded_for ? this.$t('network.text_445') : '-'
              },
            },
          ],
        },
        {
          title: this.$t('network.text_469'),
          items: [
            {
              field: 'health_check',
              title: this.$t('network.text_474'),
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return row.health_check === 'on' ? this.$t('network.text_481') : this.$t('network.text_480')
              },
            },
            {
              field: 'health_check_type',
              title: this.$t('network.text_400'),
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                if (row.health_check_type) {
                  return row.health_check_type.toUpperCase()
                }
                return '-'
              },
            },
            {
              field: 'health_check_uri',
              title: this.$t('network.text_401'),
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return row.health_check_uri
              },
            },
            {
              field: 'health_check_domain',
              title: this.$t('network.text_403'),
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return row.health_check_domain
              },
            },
            {
              field: 'health_check_http_code',
              title: this.$t('network.text_405'),
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return row.health_check_http_code
              },
            },
            {
              field: 'health_check_timeout',
              title: this.$t('network.text_406'),
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return row.health_check_timeout + this.$t('network.text_76')
              },
            },
            {
              field: 'health_check_interval',
              title: this.$t('network.text_408'),
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return row.health_check_interval + this.$t('network.text_76')
              },
            },
            {
              field: 'health_check_rise',
              title: this.$t('network.text_410'),
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return row.health_check_rise + this.$t('network.text_411')
              },
            },
            {
              field: 'health_check_fall',
              title: this.$t('network.text_413'),
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return row.health_check_fall + this.$t('network.text_411')
              },
            },
            {
              field: 'health_check_req',
              title: this.$t('network.text_414'),
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return row.health_check_req
              },
            },
            {
              field: 'health_check_exp',
              title: this.$t('network.text_416'),
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return row.health_check_exp
              },
            },
          ],
        },
      ],
    }
  },
  computed: {
    isRedirect () {
      return this.data.redirect === 'raw'
    },
  },
}
</script>

<style lang="less" scoped>
::v-deep .detail-item {
  .detail-item-title {
    width: 200px !important;
  }
  .detail-item-value {
    margin-left: 200px;
  }
}
</style>
