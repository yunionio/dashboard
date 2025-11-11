import * as R from 'ramda'
import { mapGetters } from 'vuex'
import WindowsMixin from '@/mixins/windows'
import storage from '@/utils/storage'
import store from '@/store'
import i18n from '@/locales'

export default {
  name: 'TopAlert',
  mixins: [WindowsMixin],
  computed: {
    ...mapGetters(['common', 'isAdminMode']),
    topAlert () {
      return this.common.topAlert || {}
    },
    globalServices () {
      return this.common.globalServices || []
    },
    commonService () {
      return this.globalServices.find(v => v.type === 'common')
    },
  },
  methods: {
    renderMessageChildren (messageOptions = []) {
      return messageOptions.map(item => {
        if (R.is(Array, item)) {
          return this.$createElement(...R.clone(item))
        }
        return this.$createElement('span', item)
      })
    },
    renderMessage (key, { alertProps, messageOptions, interval = 1000 * 60 * 60 * 24 } = {}) {
      return this.$createElement('a-alert', {
        class: 'global-top-alert',
        style: {
          marginBottom: '8px',
        },
        props: {
          type: 'warning',
          closable: true,
          ...alertProps,
        },
        on: {
          close: () => {
            const storageTopAlert = storage.get('topAlert') || {}
            const newStorageTopAlert = { ...storageTopAlert }
            newStorageTopAlert[key] = this.$moment().valueOf() + interval
            storage.set('topAlert', newStorageTopAlert)
            this.$bus.$emit('GlobalTopAlertUpdate')
          },
        },
        scopedSlots: {
          message: () => {
            const settingApiServerLink = [
              'a', {
                style: {
                  marginLeft: '10px',
                },
                on: {
                  click: this.openUpdateApiServerDialog,
                },
              }, i18n.t('common.setting')]
            if (this.isAdminMode && key === 'apiServer') {
              return this.renderMessageChildren([...messageOptions, settingApiServerLink])
            }
            return this.renderMessageChildren(messageOptions)
          },
        },
      })
    },
    openUpdateApiServerDialog () {
      const url = this.topAlert.apiServer.messageOptions[1][2] || location.origin
      const key = 'api_server'
      const service = 'common'
      const serviceId = this.commonService?.id || 'f05647ced7eb4ef189b49593dd0ab938'
      const row = {
        opt: {
          component: 'a-input',
          dialog: 'GlobalSettingUpdateDialog',
          parser: (val) => {
            let v = val
            if (v.endsWith('.')) {
              v = v.substring(0, v.length - 1)
            }
            if (v.endsWith('/')) {
              v = v.substring(0, v.length - 1)
            }
            return v
          },
          formatter: (val) => {
            let v = val
            if (v.endsWith('.')) {
              v = v.substring(0, v.length - 1)
            }
            if (v.endsWith('/')) {
              v = v.substring(0, v.length - 1)
            }
            return v
          },
          ok: (key, val, serviceId) => {
            // update store.auth.regions
            store.dispatch('auth/getRegions')
            const currentHost = window.location.hostname
            if (val) {
              if (!val.includes(currentHost)) {
                store.dispatch('common/updateObject', {
                  name: 'topAlert',
                  data: {
                    apiServer: {
                      messageOptions: [
                        i18n.t('system.text_186'),
                        ['a', { attrs: { href: val } }, val],
                        i18n.t('system.text_187'),
                      ],
                      interval: 1000 * 60 * 60 * 24,
                    },
                  },
                })
              } else {
                store.dispatch('common/deleteObject', {
                  name: 'topAlert',
                  key: 'apiServer',
                })
              }
            }
          },
        },
        label: this.$te(`globalSetting.${service}$${key}.label`) ? this.$t(`globalSetting.${service}$${key}.label`) : key,
        desc: this.$te(`globalSetting.${service}$${key}.desc`) ? this.$t(`globalSetting.${service}$${key}.desc`) : '-',
        serviceId,
        key,
        service,
        value: url,
      }
      this.createDialog('GlobalSettingUpdateDialog', {
        data: [row],
        success: () => {},
        ok: row.opt.ok,
      })
    },
  },
  render () {
    if (!R.isEmpty(this.topAlert) && !R.isNil(this.topAlert)) {
      const items = []
      const storageTopAlert = storage.get('topAlert') || {}
      R.forEachObjIndexed((value, key) => {
        const time = storageTopAlert[key]
        if (!time || this.$moment().valueOf() > time) {
          if (key === 'apiServer') {
            const url = value.messageOptions[1][2]
            if (url !== location.origin) {
              const message = this.renderMessage(key, value)
              items.push(message)
            }
          } else {
            const message = this.renderMessage(key, value)
            items.push(message)
          }
        }
      }, this.topAlert)
      return this.$createElement('div', { class: 'top-alert' }, items)
    }
    return null
  },
}
