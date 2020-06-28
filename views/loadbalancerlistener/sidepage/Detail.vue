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
import { getCopyWithContentTableColumn, getBrandTableColumn, getStatusTableColumn } from '@/utils/common/tableColumn'
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
          ],
        },
        {
          title: '高级信息',
          items: [
            {
              field: 'sticky_session',
              title: '调度算法',
              formatter: ({ row }) => {
                return this.$t('schedulerTypeOpts')[row.scheduler]
              },
            },
            {
              field: 'sticky_session',
              title: '会话保持',
              formatter: ({ row }) => {
                if (row.sticky_session === 'off') return '关闭'
                return '开启'
              },
            },
            {
              field: 'sticky_session_type',
              title: 'Cookie处理方式',
              formatter: ({ row }) => {
                if (row.sticky_session_type === 'insert') return '植入 Cookie'
                else if (row.sticky_session_type === 'server') return '重写 Cookie'
                else return '-'
              },
            },
            {
              field: 'sticky_session_cookie_timeout',
              title: '会话超时时间',
              formatter: ({ row }) => {
                return `${row.sticky_session_cookie_timeout} 秒`
              },
            },
            {
              field: 'acl_type',
              title: '访问控制方式',
              formatter: ({ row }) => {
                if (row.acl_type === 'white') return '白名单'
                else if (row.acl_type === 'black') return '黑名单'
                return '-'
              },
            },
            getStatusTableColumn({ statusModule: 'lbAcl', field: 'acl_status', title: '访问控制状态' }),
            getCopyWithContentTableColumn({
              field: 'acl_name',
              title: '访问控制名称',
              hideField: true,
              slotCallback: row => {
                if (!row.acl_name || !row.acl_id) return '-'
                return [
                  <side-page-trigger permission='lb_loadbalanceracls_get' name='LbaclSidePage' id={row.acl_id} vm={this}>{ row.acl_name }</side-page-trigger>,
                ]
              },
            }),
            {
              field: 'redirect',
              title: '重定向',
              formatter: ({ row }) => {
                return row.redirect === 'raw' ? '已开启' : '未开启'
              },
            },
            {
              field: 'redirect',
              title: '重定向方式',
              formatter: ({ row }) => {
                if (row.redirect !== 'raw') return '-'
                return this.$t('redirect_code')[row.redirect_code] ? this.$t('redirect_code')[row.redirect_code].name : '-'
              },
            },
            {
              field: 'sticky_session_cookie',
              title: 'Cookie名称',
            },
            {
              field: 'gzip',
              title: 'Gzip数据压缩',
              formatter: ({ row }) => {
                return row.gzip ? '开启' : '关闭'
              },
            },
            {
              field: 'xforwarded_for',
              title: '获取客户端真实IP',
              formatter: ({ row }) => {
                if (row.xforwarded_for || row.send_proxy !== 'off') {
                  return '开启'
                }
                return '关闭'
              },
            },
            {
              field: 'enable_http2',
              title: '启用HTTP2.0',
              formatter: ({ row }) => {
                return row.enable_http2 ? '开启' : '关闭'
              },
            },
            {
              field: 'egress_mbps',
              title: '带宽峰值',
              formatter: ({ row }) => {
                if (row.egress_mbps === 0) return '无限制'
                if (R.is(Number, row.egress_mbps)) return `${row.egress_mbps} Mbps`
                return '-'
              },
            },
            {
              field: 'client_idle_timeout',
              title: '连接空闲超时时间',
              formatter: ({ row }) => row.client_idle_timeout + ' 秒',
            },
            {
              field: 'client_request_timeout',
              title: '连接请求超时时间',
              formatter: ({ row }) => row.client_request_timeout + ' 秒',
            },
            {
              field: 'send_proxy',
              title: '设置PROXY协议',
              formatter: ({ row }) => {
                return this.$t('listenerProxyOpts')[row.send_proxy]
              },
            },
            {
              field: 'client_request_timeout',
              title: '附加HTTP头部字段',
              formatter: ({ row }) => row.xforwarded_for ? '通过X-Forwarded-For字段获取客户端真实IP' : '-',
            },
          ],
        },
        {
          title: '健康检查',
          items: [
            {
              field: 'health_check',
              title: '启用健康检查',
              formatter: ({ row }) => row.health_check === 'on' ? '开启' : '关闭',
            },
            {
              field: 'health_check_type',
              title: '健康检查协议',
              formatter: ({ row }) => row.health_check_type.toUpperCase(),
            },
            {
              field: 'health_check_uri',
              title: '健康检查路径',
              formatter: ({ row }) => row.health_check_uri,
            },
            {
              field: 'health_check_domain',
              title: '健康检查域名',
              formatter: ({ row }) => row.health_check_domain,
            },
            {
              field: 'health_check_http_code',
              title: '正常状态码',
              formatter: ({ row }) => row.health_check_http_code,
            },
            {
              field: 'health_check_timeout',
              title: '健康检查响应超时时间',
              formatter: ({ row }) => row.health_check_timeout + ' 秒',
            },
            {
              field: 'health_check_interval',
              title: '健康检查间隔时间',
              formatter: ({ row }) => row.health_check_interval + ' 秒',
            },
            {
              field: 'health_check_rise',
              title: '健康检查健康阈值',
              formatter: ({ row }) => row.health_check_rise + ' 次',
            },
            {
              field: 'health_check_fall',
              title: '健康检查不健康阈值',
              formatter: ({ row }) => row.health_check_fall + ' 次',
            },
            {
              field: 'health_check_req',
              title: '健康检查请求',
              formatter: ({ row }) => row.health_check_req,
            },
            {
              field: 'health_check_exp',
              title: '健康检查返回结果',
              formatter: ({ row }) => row.health_check_exp,
            },
          ],
        },
      ],
    }
  },
}
</script>

<style lang="scss" scoped>
::v-deep .detail-item {
  .detail-item-title {
    width: 200px !important;
  }
  .detail-item-value {
    margin-left: 200px;
  }
}
</style>
