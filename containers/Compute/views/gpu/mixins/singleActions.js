import i18n from '@/locales'
export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('compute.text_483', [this.$t('dictionary.server')]),
        permission: 'server_perform_attach_isolated_device',
        action: obj => {
          this.createDialog('AttachGpuDialog', {
            data: [obj],
            title: this.$t('compute.text_483', [this.$t('dictionary.server')]),
            columns: this.columns,
            refresh: this.refresh,
          })
        },
        meta: obj => {
          return {
            validate: !obj.guest_id,
          }
        },
      },
      {
        label: this.$t('compute.text_485', [this.$t('dictionary.server')]),
        permission: 'server_perform_detach_isolated_device',
        action: obj => {
          this.createDialog('DetachGpuDialog', {
            data: [obj],
            title: this.$t('compute.text_485', [this.$t('dictionary.server')]),
            columns: this.columns,
            refresh: this.refresh,
          })
        },
        meta: obj => {
          if (!obj.guest_id) {
            return {
              validate: false,
              tooltip: this.$t('compute.text_487', [this.$t('dictionary.server')]),
            }
          }
          if (obj.dev_type === 'USB') {
            if (obj.guest_status !== 'ready' && obj.guest_status !== 'running') {
              return {
                validate: false,
                tooltip: this.$t('compute.text_489', [this.$t('dictionary.server')]),
              }
            }
          } else {
            if (obj.guest_status !== 'ready') {
              return {
                validate: false,
                tooltip: this.$t('compute.text_489_1', [this.$t('dictionary.server')]),
              }
            }
          }
          return {
            validate: true,
          }
        },
      },
      {
        label: i18n.t('compute.text_490'),
        permission: 'isolated_devices_update',
        action: obj => {
          this.createDialog('SetReserveResourceDialog', {
            onManager: this.onManager,
            data: [obj],
            columns: this.columns,
            refresh: this.refresh,
          })
        },
        meta: obj => {
          const { dev_type } = obj
          if (!dev_type) {
            return { validate: false }
          }
          if (dev_type.indexOf('GPU') === -1) {
            return {
              validate: false,
              tooltip: this.$t('compute.text_1398', [dev_type]),
            }
          }
          return { validate: true }
        },
      },
    ]
  },
}
