import { mapGetters } from 'vuex'
import { disableDeleteAction } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('network.text_201'),
        action: obj => {
          this.onManager('performAction', {
            steadyStatus: ['offline', 'online'],
            id: obj.id,
            managerArgs: {
              action: 'syncstatus',
            },
          })
        },
        meta: (obj) => {
          if (!this.isOwner(obj)) {
            return {
              validate: false,
              tooltip: i18n.t('network.text_627'),
            }
          }
          return {
            validate: true,
          }
        },
      },
      {
        label: i18n.t('network.text_129'),
        actions: (obj) => {
          return [
            disableDeleteAction(this, {
              name: this.$t('dictionary.cdn_domain'),
              hidden: () => {
                if (!this.isOwner(obj)) {
                  return {
                    validate: false,
                    tooltip: i18n.t('network.text_627'),
                  }
                }
              },
            }),
            {
              label: i18n.t('network.text_131'),
              permission: 'cdn_domains_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  title: i18n.t('network.text_131'),
                  name: this.$t('dictionary.cdn_domain'),
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  requestData: { force: true },
                  refresh: this.refresh,
                })
              },
              meta: () => {
                if (!this.isOwner(obj)) {
                  return {
                    validate: false,
                    tooltip: i18n.t('network.text_627'),
                  }
                }
                return this.$getDeleteResult(obj)
              },
            },
          ]
        },
      },
    ]
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo']),
  },
  methods: {
    isOwner (obj) {
      if (this.isAdminMode) return true
      if (this.isDomainMode) return obj.domain_id === this.userInfo.projectDomainId
      return false
    },
  },
}
