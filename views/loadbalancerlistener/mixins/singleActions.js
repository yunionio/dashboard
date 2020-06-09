import { LB_LISTENEER_ACTION_POLICIES } from '@Network/constants/lb'
import * as R from 'ramda'
import { PROVIDER_MAP } from '@/constants'

export default {
  created () {
    this.singleActions = [
      {
        label: '修改',
        permission: 'lb_loadbalancerlisteners_update',
        action: obj => {
          const query = {
            type: this.list ? this.data.provider : this.detailData.provider,
            listener: obj.id,
          }
          if (query.type === 'Aws') {
            query.spec = this.list ? this.data.loadbalancer_spec : this.detailData.loadbalancer_spec
          }
          this.$router.push({
            path: `/lb/${obj.loadbalancer_id}/listener-update`,
            query,
          })
        },
        meta: obj => {
          let validate = true
          let tooltip = null
          if (obj.provider && obj.provider.toLowerCase() === 'aws') {
            const spec = this.list ? this.data.loadbalancer_spec : this.detailData.loadbalancer_spec
            if (spec === 'network') {
              validate = false
              tooltip = 'AWS网络型暂不支持修改监听'
            }
          }
          return {
            validate,
            tooltip,
          }
        },
      },
      {
        label: '删除',
        permission: 'lb_loadbalancerlisteners_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            title: '删除',
            name: '监听',
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
          })
        },
        meta: obj => this.$getDeleteResult(obj),
      },
      {
        label: '更多',
        actions: row => [
          {
            label: '调整访问控制',
            permission: 'lb_loadbalancerlisteners_update',
            action: (obj) => {
              this.createDialog('LbListenerUpdateAclDialog', {
                vm: this,
                data: [obj],
                columns: this.columns,
                onManager: this.onManager,
              })
            },
            meta: () => {
              return this.getActionMeta(true, row, 'aclUpdate')
            },
          },
          {
            label: '启用',
            permission: 'lb_loadbalancerlisteners_enable',
            action: (row) => {
              this.onManager('performAction', {
                id: row.id,
                managerArgs: {
                  action: 'status',
                  data: {
                    status: 'enabled',
                  },
                },
              })
            },
            meta: ({ status }) => {
              return this.getActionMeta(status !== 'enabled', row, 'enable')
            },
          },
          {
            label: '禁用',
            permission: 'lb_loadbalancerlisteners_disable',
            action: (row) => {
              this.onManager('performAction', {
                id: row.id,
                managerArgs: {
                  action: 'status',
                  data: {
                    status: 'disabled',
                  },
                },
              })
            },
            meta: ({ status }) => {
              return this.getActionMeta(status !== 'disabled', row, 'disable')
            },
          },
          {
            label: '启用健康检查',
            permission: 'lb_loadbalancerlisteners_udpate',
            action: (row) => {
              this.onManager('update', {
                id: row.id,
                managerArgs: {
                  data: { health_check: 'on' },
                },
              })
            },
            meta: (row) => {
              if (row.redirect === 'raw') {
                return {
                  validate: false,
                  tooltip: '重定向类型的监听不支持此操作',
                }
              }
              return this.getActionMeta(row.health_check === 'off', row, 'enableHealthCheck')
            },
          },
          {
            label: '停用健康检查',
            permission: 'lb_loadbalancerlisteners_udpate',
            action: (row) => {
              this.onManager('update', {
                id: row.id,
                managerArgs: {
                  data: { health_check: 'off' },
                },
              })
            },
            meta: (row) => {
              if (row.redirect === 'raw') {
                return {
                  validate: false,
                  tooltip: '重定向类型的监听不支持此操作',
                }
              }
              return this.getActionMeta(row.health_check === 'on', row, 'disableHealthCheck')
            },
          },
        ],
      },
    ]
  },
  methods: {
    getActionMeta (expect, row, action) {
      const providerItem = LB_LISTENEER_ACTION_POLICIES[row.provider.toLowerCase()]
      if (providerItem) {
        if ((R.is(Function, providerItem[action]) && providerItem[action](row) === false) || providerItem[action] === false) {
          return {
            validate: false,
            tooltip: `【${PROVIDER_MAP[row.provider].label}】暂不支持该操作`,
          }
        }
      }
      if (!expect) return { validate: false }
      return { validate: true }
    },
  },
}
