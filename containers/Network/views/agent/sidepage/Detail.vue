<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import {
  getUserTagColumn,
  getExtTagColumn,
} from '@/utils/common/detailColumn'

export default {
  name: 'AgentDetail',
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
    columns: Array,
  },
  data () {
    const formatDate = ({ cellValue }) => {
      return this.$moment(cellValue).format(this.$t('network.text_36'))
    }
    return {
      deploymentServer: {},
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
        getUserTagColumn({ onManager: this.onManager, resource: 'loadbalanceragent', columns: () => this.columns, tipName: this.$t('network.text_20') }),
        getExtTagColumn({ onManager: this.onManager, resource: 'loadbalanceragent', columns: () => this.columns, tipName: this.$t('network.text_20') }),
        {
          field: 'cluster',
          title: this.$t('network.text_19'),
        },
        {
          field: 'ha_state',
          title: this.$t('network.text_22'),
        },
        {
          field: 'hb_last_seen',
          title: this.$t('network.text_23'),
          formatter: ({ row }) => {
            return row.hb_last_seen ? this.$moment(row.hb_last_seen).fromNow() : '-'
          },
        },
        {
          field: 'zone',
          title: this.$t('network.text_24'),
        },
        {
          field: 'hb_timeout',
          title: this.$t('network.text_75'),
          formatter: ({ row }) => {
            return `${row.hb_timeout}s`
          },
        },
        {
          field: 'deployment',
          title: this.$t('network.text_135'),
          slots: {
            default: ({ row }, h) => {
              if (this.deploymentServer.id) {
                const name = this.deploymentServer.type === 'server' ? 'VmInstanceSidePage' : 'HostSidePage'
                return [<side-page-trigger name={name} id={this.deploymentServer.id} vm={this}>{ this.deploymentServer.name }</side-page-trigger>]
              }
              return '-'
            },
          },
        },
      ],
      extraInfo: [
        {
          title: this.$t('network.text_136'),
          items: [
            {
              field: 'loadbalancers',
              title: this.$t('network.text_137'),
              formatter: formatDate,
            },
            {
              field: 'loadbalancer_listeners',
              title: this.$t('network.text_138'),
              formatter: formatDate,
            },
            {
              field: 'loadbalancer_backend_groups',
              title: this.$t('network.text_139'),
              formatter: formatDate,
            },
            {
              field: 'loadbalancer_backends',
              title: this.$t('network.text_140'),
              formatter: formatDate,
            },
            {
              field: 'loadbalancer_listener_rules',
              title: this.$t('network.text_141'),
              formatter: formatDate,
            },
            {
              field: 'loadbalancer_acls',
              title: this.$t('network.text_142'),
              formatter: formatDate,
            },
            {
              field: 'loadbalancer_certificates',
              title: this.$t('network.text_143'),
              formatter: formatDate,
            },
          ],
        },
        {
          title: this.$t('network.text_144'),
          items: [
            {
              field: 'params.vrrp.virtual_router_id',
              title: this.$t('network.text_87'),
            },
            {
              field: 'params.vrrp.priority',
              title: this.$t('network.text_81'),
            },
            {
              field: 'params.vrrp.preempt',
              title: this.$t('network.text_83'),
              formatter: ({ row }) => {
                return row.params.vrrp.preempt ? this.$t('network.text_145') : this.$t('network.text_33')
              },
            },
            {
              field: 'params.vrrp.interface',
              title: this.$t('network.text_89'),
            },
            {
              field: 'params.vrrp.advert_int',
              title: this.$t('network.text_92'),
              formatter: ({ row }) => `${row.params.vrrp.advert_int || 0}s`,
            },
            {
              field: 'params.vrrp.pass',
              title: this.$t('network.text_95'),
            },
          ],
        },
        {
          title: this.$t('network.text_146'),
          items: [
            {
              field: 'params.haproxy.global_nbthread',
              title: this.$t('network.text_106'),
            },
            {
              field: 'params.haproxy.global_log',
              title: this.$t('network.text_107'),
              formatter: ({ row }) => {
                const { haproxy } = row.params
                if (haproxy && haproxy.global_log) {
                  return haproxy.global_log.split(' ')[1]
                }
                return '-'
              },
            },
            {
              field: 'params.haproxy.log_http',
              title: this.$t('network.text_110'),
              formatter: ({ row }) => {
                return row.params.haproxy.log_http ? this.$t('network.text_145') : this.$t('network.text_33')
              },
            },
            {
              field: 'params.haproxy.log_tcp',
              title: this.$t('network.text_111'),
              formatter: ({ row }) => {
                return row.params.haproxy.log_tcp ? this.$t('network.text_145') : this.$t('network.text_33')
              },
            },
            {
              field: 'params.haproxy.log_normal',
              title: this.$t('network.text_112'),
              formatter: ({ row }) => {
                return row.params.haproxy.log_normal ? this.$t('network.text_145') : this.$t('network.text_33')
              },
            },
            {
              field: 'params.haproxy.tune_http_maxhdr',
              title: this.$t('network.text_113'),
            },
            {
              field: 'params.haproxy_conf_tmpl',
              title: this.$t('network.text_104'),
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
          title: this.$t('network.text_147'),
          items: [
            {
              field: 'params.telegraf.haproxy_input_interval',
              title: this.$t('network.text_103'),
              formatter: ({ row }) => {
                return `${row.params.telegraf.haproxy_input_interval || 0}s`
              },
            },
            {
              field: 'params.telegraf.influx_db_output_name',
              title: this.$t('network.text_102'),
            },
            {
              field: 'params.telegraf.influx_db_output_url',
              title: this.$t('network.text_98'),
              formatter: ({ row }) => {
                let str = row.params.telegraf.influx_db_output_url || '-'
                if (row && row.params && row.params.telegraf && row.params.telegraf.influx_db_output_url) {
                  str += this.$t('network.text_148')
                }
                return str
              },
            },
            {
              field: 'params.telegraf_conf_tmpl',
              title: this.$t('network.text_104'),
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
          title: this.$t('network.text_149'),
          items: [
            {
              field: 'params.keepalived_conf_tmpl',
              title: this.$t('network.text_104'),
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
  created () {
    this.queryDeploymentHost(this.data.deployment)
  },
  methods: {
    async queryDeploymentHost (deployment) {
      if (!deployment || !deployment.host) return '-'
      const [type, id] = deployment.host.split(':')
      try {
        if (type === 'server') {
          const { data } = await new this.$Manager('servers').get({ id })
          this.deploymentServer = data
        }
        if (type === 'host') {
          const { data } = await new this.$Manager('hosts').get({ id })
          this.deploymentServer = data
        }
        this.deploymentServer.type = type
      } catch (err) {
        throw err
      }
    },
  },
}
</script>
