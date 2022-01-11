import { mapGetters } from 'vuex'
import { Base64 } from 'js-base64'
import qs from 'qs'
import { commonUnabled, cloudEnabled, cloudUnabledTip } from '../../vminstance/utils'
import { disableDeleteAction } from '@/utils/common/tableActions'
import expectStatus from '@/constants/expectStatus'
import i18n from '@/locales'
import { solWebConsole, jnlpConsole } from '../../../utils/webconsole'
import { hostServerActions } from '../../../utils/hostActions'

export default {
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode']),
  },
  destroyed () {
    this.webconsoleManager = null
  },
  created () {
    this.webconsoleManager = new this.$Manager('webconsole', 'v1')

    this.singleActions = [
      {
        label: i18n.t('compute.text_341'),
        actions: obj => {
          let ret = []
          ret.push(solWebConsole(this.webconsoleManager, obj, this.openWebConsole))
          const mapIpActions = (ipArr, type) => {
            if (!['IP SSH', 'EIP SSH'].includes(type)) throw Error(i18n.t('compute.text_343'))
            const options = []
            ipArr.forEach(v => {
              const meta = () => {
                const ret = {
                  validate: false,
                  tooltip: null,
                }
                if (obj.os_type === 'Windows') {
                  ret.tooltip = i18n.t('compute.text_344')
                }
                ret.validate = cloudEnabled(type, obj)
                ret.tooltip = cloudUnabledTip(type, obj)
                return ret
              }
              options.push({
                label: `SSH ${v}`,
                action: () => {
                  this.webconsoleManager.performAction({
                    id: 'ssh',
                    action: v,
                  }).then(({ data }) => {
                    this.openWebConsole(obj, data)
                  })
                },
                meta,
              })
              options.push({
                label: i18n.t('compute.text_345', [v]),
                action: () => {
                  this.createDialog('SmartFormDialog', {
                    title: i18n.t('compute.text_346'),
                    data: [obj],
                    callback: async (data) => {
                      const response = await this.webconsoleManager.performAction({
                        id: 'ssh',
                        action: v,
                        data,
                      })
                      this.openWebConsole(obj, response.data)
                    },
                    decorators: {
                      port: [
                        'port',
                        {
                          validateFirst: true,
                          rules: [
                            { required: true, message: i18n.t('compute.text_347') },
                            {
                              validator: (rule, value, _callback) => {
                                const num = parseFloat(value)
                                if (!/^\d+$/.test(value) || !num || num > 65535) {
                                  _callback(i18n.t('compute.text_348'))
                                }
                                _callback()
                              },
                            },
                          ],
                        },
                        {
                          label: i18n.t('compute.text_349'),
                          placeholder: i18n.t('compute.text_350'),
                        },
                      ],
                    },
                  })
                },
                meta,
              })
            })
            return options
          }
          let eips = (obj.eip || '').split(',').filter(item => !!item)
          let ips = (obj.ips || '').split(',').filter(item => !!item)
          eips = eips.length ? mapIpActions(eips, 'EIP SSH') : []
          ips = ips.length ? mapIpActions(ips, 'IP SSH') : []
          ret = ret.concat(eips).concat(ips)
          ret.push(jnlpConsole(new this.$Manager('servers', 'v2'), obj))
          return ret
        },
        meta: (obj) => {
          let ret = {
            validate: true,
            tooltip: null,
          }
          ret = this.$isValidateResourceLock(obj)
          return ret
        },
      },
      {
        label: i18n.t('compute.text_352'),
        actions: (obj) => {
          return [
            {
              label: i18n.t('compute.text_353'),
              submenus: hostServerActions(this.onManager, obj, this, false),
            },
            {
              label: i18n.t('compute.text_356'),
              submenus: [
                {
                  label: i18n.t('compute.text_357'),
                  permission: 'server_perform_rebuild_root',
                  action: () => {
                    this.createDialog('VmRebuildRootDialog', {
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                    })
                  },
                  meta: () => {
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (obj.metadata.is_fake_baremetal_server === 'true') {
                      ret.validate = false
                      return ret
                    }
                    if (obj.status !== 'ready') {
                      ret.tooltip = i18n.t('compute.text_358')
                      return ret
                    }
                    if (commonUnabled(obj)) return ret
                    ret.validate = cloudEnabled('rebuildRoot', obj)
                    ret.tooltip = cloudUnabledTip('rebuildRoot', obj)
                    return ret
                  },
                },
                {
                  label: i18n.t('compute.perform_sync_status'),
                  permission: 'server_perform_syncstatus',
                  action: () => {
                    this.onManager('performAction', {
                      steadyStatus: Object.values(expectStatus.server).flat(),
                      id: obj.id,
                      managerArgs: {
                        action: 'syncstatus',
                      },
                    })
                  },
                },
                {
                  label: this.$t('compute.perform_change_owner', [this.$t('dictionary.project')]),
                  permission: 'server_perform_change_owner',
                  action: () => {
                    this.createDialog('ChangeOwenrDialog', {
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                      resource: 'servers',
                    })
                  },
                  meta: () => {
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (commonUnabled(obj)) return ret
                    ret.validate = true
                    return ret
                  },
                },
                {
                  label: i18n.t('compute.text_359'),
                  action: () => {
                    this.createDialog('VmCloneDialog', {
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                      type: 'baremetal',
                    })
                  },
                  meta: () => {
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (obj.metadata.is_fake_baremetal_server === 'true') ret.validate = false
                    return ret
                  },
                },
              ],
            },
            {
              label: i18n.t('compute.text_360'),
              submenus: [
                {
                  label: i18n.t('compute.text_276'),
                  permission: 'server_perform_deploy',
                  action: () => {
                    this.createDialog('VmResetPasswordDialog', {
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                    })
                  },
                  meta: () => {
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (obj.metadata.is_fake_baremetal_server === 'true') return ret
                    if (commonUnabled(obj)) return ret
                    if (obj.keypair_id && obj.keypair_id.toLowerCase() !== 'none') {
                      ret.tooltip = i18n.t('compute.text_277')
                      return ret
                    }
                    ret.validate = cloudEnabled('resetPassword', obj)
                    ret.tooltip = cloudUnabledTip('resetPassword', obj)
                    return ret
                  },
                },
                {
                  label: i18n.t('compute.text_361'),
                  permission: 'server_perform_deploy',
                  action: () => {
                    this.createDialog('VmBindKeypairDialog', {
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                    })
                  },
                  meta: () => {
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (obj.metadata.is_fake_baremetal_server === 'true') return ret
                    if (commonUnabled(obj)) return ret
                    if (obj.os_type === 'Windows') {
                      ret.tooltip = i18n.t('compute.text_362')
                      return ret
                    }
                    if (obj.keypair) {
                      ret.tooltip = i18n.t('compute.text_363')
                      return ret
                    }
                    ret.validate = cloudEnabled('bindKeyPair', obj)
                    ret.tooltip = cloudUnabledTip('bindKeyPair', obj)
                    return ret
                  },
                },
                {
                  label: i18n.t('compute.text_364'),
                  permission: 'server_perform_deploy',
                  action: () => {
                    this.createDialog('VmUnbindKeypairDialog', {
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                    })
                  },
                  meta: () => {
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (obj.metadata.is_fake_baremetal_server === 'true') return ret
                    if (commonUnabled(obj)) return ret
                    if (obj.os_type === 'Windows') {
                      ret.tooltip = i18n.t('compute.text_362')
                      return ret
                    }
                    if (!obj.keypair) {
                      ret.tooltip = i18n.t('compute.text_365')
                      return ret
                    }
                    ret.validate = cloudEnabled('unBindKeyPair', obj)
                    ret.tooltip = cloudUnabledTip('unBindKeyPair', obj)
                    return ret
                  },
                },
              ],
            },
            {
              label: i18n.t('compute.text_96'),
              submenus: [
                {
                  label: i18n.t('compute.text_366'),
                  permission: 'server_perform_insertiso',
                  action: () => {
                    this.createDialog('VmMountIsoDialog', {
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                      refresh: this.refresh,
                    })
                  },
                  meta: () => {
                    return {
                      validate: obj.cdrom_support && !obj.cdrom,
                    }
                  },
                },
                {
                  label: i18n.t('compute.text_367'),
                  permission: 'server_perform_ejectiso',
                  action: () => {
                    this.createDialog('VmUnmountIsoDialog', {
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                      refresh: this.refresh,
                    })
                  },
                  meta: () => {
                    return {
                      validate: obj.cdrom_support && obj.cdrom,
                    }
                  },
                },
              ],
            },
            {
              label: i18n.t('compute.perform_delete'),
              submenus: [
                disableDeleteAction(this),
                {
                  label: i18n.t('compute.perform_delete'),
                  permission: 'server_delete',
                  action: () => {
                    this.createDialog('DeleteResDialog', {
                      vm: this,
                      data: [obj],
                      columns: this.columns,
                      onManager: this.onManager,
                      title: i18n.t('compute.perform_delete'),
                      success: () => {
                        this.destroySidePages()
                      },
                    })
                  },
                  meta: () => {
                    const ret = {
                      validate: false,
                      tooltip: null,
                    }
                    if (this.isAdminMode && obj.billing_type === 'prepaid') {
                      ret.tooltip = i18n.t('compute.text_285')
                      return ret
                    }
                    if (!obj.can_delete) {
                      ret.tooltip = i18n.t('compute.text_284')
                      return ret
                    }
                    ret.validate = true
                    return ret
                  },
                },
              ],
            },
          ]
        },
        meta: (obj) => {
          let ret = {
            validate: true,
            tooltip: null,
          }
          ret = this.$isValidateResourceLock(obj)
          return ret
        },
      },
    ]
  },
  methods: {
    openWebConsole (obj, data) {
      let connectParams = qs.parse(data.connect_params)
      if (!connectParams.access_token) {
        connectParams = {
          data: data.connect_params,
        }
      } else {
        connectParams = {
          data: Base64.encode(data.connect_params),
        }
      }
      const query = {
        ...connectParams,
        session: data.session,
        hypervisor: obj.hypervisor,
        os_type: obj.os_type,
        ips: obj.ips,
        instanceName: obj.name,
      }
      // const href = `${this.$appConfig.webConsolePath}?${qs.stringify(query)}`
      const href = `${this.$store.getters.auth.regions.api_server}/web-console/?${qs.stringify(query)}`
      window.open(href)
    },
  },
}
