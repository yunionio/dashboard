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
          title: '配置信息',
          items: [
            {
              field: 'listener_type/listener_port',
              title: '前端协议/端口',
              formatter: ({ row }) => {
                return `${row.listener_type.toUpperCase()}: ${row.listener_port}`
              },
            },
            getCopyWithContentTableColumn({
              field: 'loadbalancer',
              title: '负载均衡实例',
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
              title: '后端服务器组',
              hideField: true,
              slotCallback: row => {
                if (this.isRedirect) return '-'
                if (!row.backend_group) return '-'
                return [
                  <side-page-trigger name='LoadbalancerbackendgroupSidePage' id={row.backend_group_id} vm={this}>{ row.backend_group }</side-page-trigger>,
                ]
              },
            }),
          ],
        },
        {
          title: '高级信息',
          items: [
            {
              field: 'sticky_session',
              title: '调度算法',
              formatter: ({ row }) => {
                return this.isRedirect ? '-' : this.$t('schedulerTypeOpts')[row.scheduler]
              },
            },
            {
              field: 'sticky_session',
              title: '会话保持',
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                if (row.sticky_session === 'off') return '未开启'
                return '已开启'
              },
            },
            {
              field: 'sticky_session_type',
              title: 'Cookie处理方式',
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                if (row.sticky_session_type === 'insert') return '植入 Cookie'
                else if (row.sticky_session_type === 'server') return '重写 Cookie'
                else return '-'
              },
            },
            {
              field: 'sticky_session_cookie',
              title: 'Cookie名称',
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                if (row.sticky_session_type === 'insert') return '植入 Cookie'
                else if (row.sticky_session_type === 'server') return '重写 Cookie'
                else return '-'
              },
            },
            {
              field: 'sticky_session_cookie_timeout',
              title: '会话超时时间',
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return `${row.sticky_session_cookie_timeout} 秒`
              },
            },
            {
              field: 'acl_type',
              title: '访问控制',
              formatter: ({ row }) => {
                if (row.acl_status === 'on') {
                  return [
                    <div>{row.acl_type === 'white' ? '白名单' : '黑名单'} <side-page-trigger permission='lb_loadbalanceracls_get' name='LbaclSidePage' id={row.acl_id} vm={this}>{ row.acl_name }</side-page-trigger></div>,
                  ]
                }
                return '未开启'
              },
            },
            {
              field: 'redirect',
              title: '重定向',
              formatter: ({ row }) => {
                return row.redirect === 'raw' ? '已开启' : '未开启'
              },
            },
            {
              field: 'redirect_code',
              title: '重定向方式',
              formatter: ({ row }) => {
                if (row.redirect !== 'raw') return '-'
                return this.$t('redirect_code')[row.redirect_code] ? this.$t('redirect_code')[row.redirect_code].name : '-'
              },
            },
            {
              field: 'redirect_scheme',
              title: '重定向至',
              formatter: ({ row }) => {
                if (row.redirect !== 'raw') return '-'
                return [row.redirect_scheme, row.redirect_host, row.redirect_path].filter(item => !!item).join('、')
              },
            },
            {
              field: 'backend_connect_timeout',
              title: '后端连接超时时间',
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return row.backend_connect_timeout + '秒'
              },
            },
            {
              field: 'backend_idle_timeout',
              title: '后端连接空闲时间',
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return row.backend_idle_timeout + '秒'
              },
            },
            {
              field: 'client_idle_timeout',
              title: '连接空闲超时时间',
              formatter: ({ row }) => {
                return row.client_idle_timeout + ' 秒'
              },
            },
            {
              field: 'client_request_timeout',
              title: '连接请求超时时间',
              formatter: ({ row }) => {
                return row.client_request_timeout + ' 秒'
              },
            },
            {
              field: 'http_request_rate',
              title: '限定接收请求速率',
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return row.http_request_rate + ' 秒'
              },
            },
            {
              field: 'http_request_rate_per_src',
              title: '限定同源IP发送请求速率',
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return row.http_request_rate_per_src + ' 秒'
              },
            },
            {
              field: 'enable_http2',
              title: 'HTTP2.0',
              formatter: ({ row }) => {
                return row.enable_http2 ? '已开启' : '未开启'
              },
            },
            {
              field: 'gzip',
              title: 'Gzip数据压缩',
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return row.gzip ? '已开启' : '未开启'
              },
            },
            {
              field: 'xforwarded_for',
              title: '获取客户端真实IP',
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                if (row.xforwarded_for || row.send_proxy !== 'off') {
                  return '已开启'
                }
                return '未开启'
              },
            },
            {
              field: 'egress_mbps',
              title: '带宽峰值',
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                if (row.egress_mbps === 0) return '无限制'
                if (R.is(Number, row.egress_mbps)) return `${row.egress_mbps} Mbps`
                return '-'
              },
            },
            {
              field: 'send_proxy',
              title: '设置PROXY协议',
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return this.$t('listenerProxyOpts')[row.send_proxy]
              },
            },
            {
              field: 'client_request_timeout',
              title: '附加HTTP头部字段',
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return row.xforwarded_for ? '通过X-Forwarded-For字段获取客户端真实IP' : '-'
              },
            },
          ],
        },
        {
          title: '健康检查',
          items: [
            {
              field: 'health_check',
              title: '启用健康检查',
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return row.health_check === 'on' ? '已开启' : '未开启'
              },
            },
            {
              field: 'health_check_type',
              title: '健康检查协议',
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
              title: '健康检查路径',
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return row.health_check_uri
              },
            },
            {
              field: 'health_check_domain',
              title: '健康检查域名',
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return row.health_check_domain
              },
            },
            {
              field: 'health_check_http_code',
              title: '正常状态码',
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return row.health_check_http_code
              },
            },
            {
              field: 'health_check_timeout',
              title: '健康检查响应超时时间',
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return row.health_check_timeout + ' 秒'
              },
            },
            {
              field: 'health_check_interval',
              title: '健康检查间隔时间',
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return row.health_check_interval + ' 秒'
              },
            },
            {
              field: 'health_check_rise',
              title: '健康检查健康阈值',
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return row.health_check_rise + ' 次'
              },
            },
            {
              field: 'health_check_fall',
              title: '健康检查不健康阈值',
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return row.health_check_fall + ' 次'
              },
            },
            {
              field: 'health_check_req',
              title: '健康检查请求',
              formatter: ({ row }) => {
                if (this.isRedirect) return '-'
                return row.health_check_req
              },
            },
            {
              field: 'health_check_exp',
              title: '健康检查返回结果',
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
