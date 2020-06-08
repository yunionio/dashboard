<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo" />
</template>

<script>

export default {
  name: 'AgentDetail',
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
    const formatDate = ({ cellValue }) => {
      return this.$moment(cellValue).format('YYYY年MM月DD日 HH:mm:ss')
    }
    return {
      cmOptions: {
        tabSize: 2,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        name: 'javascript',
        json: true,
        theme: 'material',
      },
      baseInfo: [
        {
          field: 'cluster_id',
          title: '集群',
        },
        {
          field: 'ha_state',
          title: '主备',
        },
        {
          field: 'hb_last_seen',
          title: '上一次心跳',
          formatter: ({ row }) => {
            return row.hb_last_seen ? this.$moment(row.hb_last_seen).fromNow() : '-'
          },
        },
        {
          field: 'zone',
          title: '可用区',
        },
        {
          field: 'hb_timeout',
          title: '心跳超时时间',
          formatter: ({ row }) => {
            return `${row.hb_timeout}s`
          },
        },
        {
          field: 'deployment',
          title: '部署机器',
          formatter: ({ row }) => {
            return (row.deployment && row.deployment.host) || '-'
          },
        },
      ],
      extraInfo: [
        {
          title: '同步时间戳',
          items: [
            {
              field: 'loadbalancers',
              title: '负载均衡实例',
              formatter: formatDate,
            },
            {
              field: 'loadbalancer_listeners',
              title: '监听',
              formatter: formatDate,
            },
            {
              field: 'loadbalancer_backend_groups',
              title: '后端服务器组',
              formatter: formatDate,
            },
            {
              field: 'loadbalancer_backends',
              title: '后端服务器',
              formatter: formatDate,
            },
            {
              field: 'loadbalancer_listener_rules',
              title: '转发策略',
              formatter: formatDate,
            },
            {
              field: 'loadbalancer_acls',
              title: '访问控制',
              formatter: formatDate,
            },
            {
              field: 'loadbalancer_certificates',
              title: '证书',
              formatter: formatDate,
            },
          ],
        },
        {
          title: 'VRRP转发实例配置信息',
          items: [
            {
              field: 'params.vrrp.advert_int',
              title: '通告间隔',
              formatter: ({ row }) => `${row.params.vrrp.advert_int || 0}s`,
            },
            {
              field: 'params.vrrp.interface',
              title: '网口',
            },
            {
              field: 'params.vrrp.pass',
              title: '密码',
            },
            {
              field: 'params.vrrp.preempt',
              title: '抢占模式',
              formatter: ({ row }) => {
                return row.params.vrrp.preempt ? '开启' : '关闭'
              },
            },
            {
              field: 'params.vrrp.priority',
              title: '优先级',
            },
            {
              field: 'params.vrrp.virtual_router_id',
              title: '路由ID',
            },
          ],
        },
        {
          title: 'HAProxy配置信息',
          items: [
            {
              field: 'params.haproxy.global_nbthread',
              title: '线程数',
            },
            {
              field: 'params.haproxy.global_log',
              title: '开启日志',
              formatter: ({ row }) => {
                return row.params.haproxy.global_log ? '开启' : '关闭'
              },
            },
            {
              field: 'params.haproxy.log_http',
              title: '开启HTTP日志',
              formatter: ({ row }) => {
                return row.params.haproxy.log_http ? '开启' : '关闭'
              },
            },
            {
              field: 'params.haproxy.log_normal',
              title: '开启Normal日志',
              formatter: ({ row }) => {
                return row.params.haproxy.log_normal ? '开启' : '关闭'
              },
            },
            {
              field: 'params.haproxy.log_tcp',
              title: '开启TCP日志',
              formatter: ({ row }) => {
                return row.params.haproxy.log_tcp ? '开启' : '关闭'
              },
            },
            {
              field: 'params.haproxy_conf_tmpl',
              title: '配置模板',
              slots: {
                default: ({ row }, h) => {
                  return [
                    <code-mirror value={ window.atob(row.params.haproxy_conf_tmpl) } options={ this.cmOptions } />,
                  ]
                },
              },
            },
          ],
        },
        {
          title: 'Telegraf配置信息',
          items: [
            {
              field: 'params.telegraf.haproxy_input_interval',
              title: 'HAProxy上报间隔',
              formatter: ({ row }) => {
                return `${row.params.telegraf.haproxy_input_interval || 0}s`
              },
            },
            {
              field: 'params.telegraf.influx_db_output_name',
              title: '数据库名称',
            },
            {
              field: 'params.telegraf.influx_db_output_url',
              title: '地址',
              formatter: ({ row }) => {
                let str = row.params.telegraf.influx_db_output_url || '-'
                if (row && row.params && row.params.telegraf && row.params.telegraf.influx_db_output_url) {
                  str += ' (忽略证书校验)'
                }
                return str
              },
            },
            {
              field: 'params.telegraf_conf_tmpl',
              title: '配置模板',
              slots: {
                default: ({ row }, h) => {
                  return [
                    <code-mirror value={ window.atob(row.params.telegraf_conf_tmpl) } options={ this.cmOptions } />,
                  ]
                },
              },
            },
          ],
        },
        {
          title: 'KeepAlived配置信息',
          items: [
            {
              field: 'params.keepalived_conf_tmpl',
              title: '配置模板',
              slots: {
                default: ({ row }, h) => {
                  return [
                    <code-mirror value={ window.atob(row.params.keepalived_conf_tmpl) } options={ this.cmOptions } />,
                  ]
                },
              },
            },
          ],
        },
      ],
    }
  },
}
</script>
