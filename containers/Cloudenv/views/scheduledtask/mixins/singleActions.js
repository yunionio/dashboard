import { mapGetters } from 'vuex'
import i18n from '@/locales'

export default {
  computed: mapGetters(['isAdminMode']),
  created () {
    this.singleActions = [
      {
        label: i18n.t('cloudenv.text_454'),
        permission: 'scheduledtasks_update',
        action: (obj) => {
          this.createDialog('ScheduledtaskEditDialog', {
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
        meta: () => {
          return {
            validate: true,
            tooltip: '',
          }
        },
      },
      {
        label: i18n.t('cloudenv.text_311'),
        actions: () => {
          return [
            {
              label: i18n.t('cloudenv.text_334'),
              permission: 'scheduledtasks_perform_enable',
              action: (obj) => {
                this.createDialog('ScheduledtaskEnabledDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                })
              },
              meta: (obj) => {
                return {
                  validate: !obj.enabled,
                  tooltip: obj.enabled ? i18n.t('cloudenv.text_455') : '',
                }
              },
            },
            {
              label: i18n.t('cloudenv.text_335'),
              permission: 'scheduledtasks_perform_disable',
              action: (obj) => {
                this.createDialog('ScheduledtaskDisabledDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                })
              },
              meta: (obj) => {
                return {
                  validate: obj.enabled,
                  tooltip: !obj.enabled ? i18n.t('cloudenv.text_456') : '',
                }
              },
            },
            {
              label: i18n.t('cloudenv.text_108'),
              permission: 'scheduledtasks_delete',
              action: obj => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: i18n.t('cloudenv.text_108'),
                  onManager: this.onManager,
                  success: () => {
                    this.destroySidePages()
                  },
                })
              },
              meta: (obj) => this.$getDeleteResult(obj),
            },
          ]
        },
      },
    ]
  },
}
