import * as R from 'ramda'
import _ from 'lodash'
import { LB_LISTENEER_ACTION_POLICIES } from '@Network/constants/lb'
import { PROVIDER_MAP } from '@/constants'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  computed: {
    singleActions () {
      const { name } = this.$route
      if (name === 'LbcertList') {
        return [
          {
            label: i18n.t('network.text_366'),
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
                  tooltip: i18n.t('network.text_367'),
                }
              }
              if (row.provider.toLowerCase() === 'azure' || row.provider.toLowerCase() === 'google' || row.provider.toLowerCase() === 'cloudflare') {
                return {
                  validate: false,
                  tooltip: i18n.t('network.text_309', [PROVIDER_MAP[row.provider].label]),
                }
              }
              return {
                validate: true,
              }
            },
          },
        ]
      }
      if (name === 'LbaclList') { return [] }
      return [
        {
          label: i18n.t('network.text_130'),
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
                tooltip = i18n.t('network.text_473')
              }
            }
            if (obj.provider && (obj.provider.toLowerCase() === 'azure' || obj.provider.toLowerCase() === 'google' || obj.provider.toLowerCase() === 'cloudflare')) {
              return {
                validate: false,
                tooltip: i18n.t('network.text_309', [PROVIDER_MAP[obj.provider].label]),
              }
            }
            return {
              validate,
              tooltip,
            }
          },
        },
        {
          label: i18n.t('network.text_131'),
          permission: 'lb_loadbalancerlisteners_delete',
          action: (obj) => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              title: i18n.t('network.text_131'),
              name: i18n.t('network.text_138'),
              data: [obj],
              columns: this.columns,
              onManager: this.onManager,
            })
          },
          meta: obj => {
            if (obj.provider && (obj.provider.toLowerCase() === 'azure' || obj.provider.toLowerCase() === 'google' || obj.provider.toLowerCase() === 'cloudflare')) {
              return {
                validate: false,
                tooltip: i18n.t('network.text_309', [PROVIDER_MAP[obj.provider].label]),
              }
            }
            return this.$getDeleteResult(obj)
          },
        },
        {
          label: i18n.t('network.text_129'),
          actions: row => [
            ...getEnabledSwitchActions(this, row, ['lb_loadbalancerlisteners_enable', 'lb_loadbalancerlisteners_disable'], {
              metas: [
                ({ status }) => {
                  if (row.provider.toLowerCase() === 'cloudflare') {
                    return {
                      validate: false,
                      tooltip: i18n.t('network.text_309', [PROVIDER_MAP[row.provider].label]),
                    }
                  }
                  return this.getActionMeta(status !== 'enabled', row, 'enable')
                },
                ({ status }) => {
                  if (row.provider.toLowerCase() === 'cloudflare') {
                    return {
                      validate: false,
                      tooltip: i18n.t('network.text_309', [PROVIDER_MAP[row.provider].label]),
                    }
                  }
                  return this.getActionMeta(status !== 'disabled', row, 'disable')
                },
              ],
              actions: [
                (row) => {
                  this.onManager('performAction', {
                    steadyStatus: this.steadyStatus,
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
                    steadyStatus: this.steadyStatus,
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
              label: i18n.t('network.text_470'),
              permission: 'lb_loadbalancerlisteners_update',
              action: (obj) => {
                this.createDialog('LbListenerUpdateAclDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  lbDetail: _.get(this.params, 'lbDetail') || this.data,
                })
              },
              meta: (obj) => {
                if (obj.provider.toLowerCase() === 'cloudflare') {
                  return {
                    validate: false,
                    tooltip: i18n.t('network.text_309', [PROVIDER_MAP[obj.provider].label]),
                  }
                }
                return this.getActionMeta(true, row, 'aclUpdate')
              },
            },
            {
              label: i18n.t('network.text_474'),
              permission: 'lb_loadbalancerlisteners_udpate',
              action: (row) => {
                this.onManager('update', {
                  steadyStatus: this.steadyStatus,
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
                    tooltip: i18n.t('network.text_475'),
                  }
                }
                if (row.provider.toLowerCase() === 'cloudflare') {
                  return {
                    validate: false,
                    tooltip: i18n.t('network.text_309', [PROVIDER_MAP[row.provider].label]),
                  }
                }
                return this.getActionMeta(row.health_check === 'off', row, 'enableHealthCheck')
              },
            },
            {
              label: i18n.t('network.text_476'),
              permission: 'lb_loadbalancerlisteners_udpate',
              action: (row) => {
                this.onManager('update', {
                  steadyStatus: this.steadyStatus,
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
                    tooltip: i18n.t('network.text_475'),
                  }
                }
                if (row.provider.toLowerCase() === 'cloudflare') {
                  return {
                    validate: false,
                    tooltip: i18n.t('network.text_309', [PROVIDER_MAP[row.provider].label]),
                  }
                }
                return this.getActionMeta(row.health_check === 'on', row, 'disableHealthCheck')
              },
            },
          ],
          meta: (obj) => {
            if (obj.provider && (obj.provider.toLowerCase() === 'azure' || obj.provider.toLowerCase() === 'google' || obj.provider.toLowerCase() === 'cloudflare')) {
              return {
                validate: false,
                tooltip: i18n.t('network.text_309', [PROVIDER_MAP[obj.provider].label]),
              }
            }
            return { validate: true }
          },
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
            tooltip: i18n.t('network.text_309', [PROVIDER_MAP[row.provider].label]),
          }
        }
      }
      if (!expect) return { validate: false }
      return { validate: true }
    },
  },
}
