import * as R from 'ramda'
import { LB_LISTENEER_ACTION_POLICIES } from '@Network/constants/lb'
import { PROVIDER_MAP } from '@/constants'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'

export default {
  computed: {
    singleActions () {
      const { name } = this.$route
      if (name === 'LbcertList') {
        return [
          {
            label: '更换证书',
            permission: 'lb_loadbalancerlisteners_update',
            action: (obj) => {
              this.createDialog('LbListenerUpdateCertificate', {
                vm: this,
                data: [obj],
                columns: this.columns,
                onManager: this.onManager,
                refresh: this.refresh,
                lbDetail: this.data,
              })
            },
            meta: (row) => {
              if (row.listener_type !== 'https') {
                return {
                  validate: false,
                  tooltip: '仅https协议支持此操作',
                }
              }
              return {
                validate: true,
              }
            },
          },
        ]
      }
      return [
        {
          label: '修改',
          permission: 'lb_loadbalancerlisteners_update',
          action: obj => {
            this.createDialog('LbListenerFormDialog', {
              listenerData: obj,
              lbDetail: this.params ? this.params.lbDetail : this.data,
              columns: this.columns,
              onManager: this.onManager,
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
            ...getEnabledSwitchActions(this, row, ['lb_loadbalancerlisteners_enable', 'lb_loadbalancerlisteners_disable'], {
              metas: [
                ({ status }) => {
                  return this.getActionMeta(status !== 'enabled', row, 'enable')
                },
                ({ status }) => {
                  return this.getActionMeta(status !== 'disabled', row, 'disable')
                },
              ],
              actions: [
                (row) => {
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
                (row) => {
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
              ],
            }),
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
