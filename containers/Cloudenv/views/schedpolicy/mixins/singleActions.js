import { mapGetters } from 'vuex'
import i18n from '@/locales'

export default {
  computed: mapGetters(['isAdminMode']),
  created () {
    this.singleActions = [
      {
        label: i18n.t('cloudenv.text_383'),
        action: (obj) => {
          this.createDialog('UpdateSchedpolicyDialog', {
            data: [obj],
            columns: this.columns,
            title: i18n.t('cloudenv.text_383'),
            onManager: this.onManager,
          })
        },
      },
      {
        label: i18n.t('cloudenv.text_311'),
        actions: obj => {
          return [
            {
              label: i18n.t('cloudenv.text_334'),
              action: obj => {
                this.onManager('update', {
                  id: obj.id,
                  managerArgs: {
                    data: { enabled: true },
                  },
                })
              },
              meta: obj => {
                return {
                  validate: !obj.enabled,
                }
              },
            },
            {
              label: i18n.t('cloudenv.text_335'),
              action: obj => {
                this.onManager('update', {
                  id: obj.id,
                  managerArgs: {
                    data: { enabled: false },
                  },
                })
              },
              meta: obj => {
                return {
                  validate: obj.enabled,
                }
              },
            },
            {
              label: i18n.t('cloudenv.text_108'),
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: i18n.t('cloudenv.text_415'),
                  name: this.$t('dictionary.schedpolicie'),
                  onManager: this.onManager,
                })
              },
              meta: () => {
                return {
                  validate: obj.can_delete,
                }
              },
            },
          ]
        },
      },
    ]
  },
}
