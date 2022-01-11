import { mapGetters } from 'vuex'
import { getDomainChangeOwnerAction, getSetPublicAction } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('network.text_201'),
        permission: 'vpcs_perform_syncstatus',
        action: obj => {
          this.onManager('performAction', {
            steadyStatus: ['running', 'ready'],
            id: obj.id,
            managerArgs: {
              action: 'syncstatus',
            },
          })
        },
        meta: (obj) => {
          if (!this.isPower(obj)) {
            return {
              validate: false,
              tooltip: i18n.t('network.text_627'),
            }
          }
          if (obj.brand && obj.brand.toLowerCase() === 'onecloud') {
            return {
              validate: false,
              tooltip: i18n.t('network.text_652'),
            }
          }
          return {
            validate: true,
          }
        },
      },
      {
        label: i18n.t('network.text_129'),
        actions: obj => {
          return [
            getDomainChangeOwnerAction(this, {
              name: this.$t('dictionary.vpc'),
              resource: 'vpcs',
            }),
            getSetPublicAction(this, {
              name: this.$t('dictionary.vpc'),
              scope: 'domain',
              resource: 'vpcs',
            }, {
              permission: 'vpcs_perform_public',
            }),
            {
              label: i18n.t('network.text_131'),
              permission: 'vpcs_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  title: i18n.t('network.text_131'),
                  name: this.$t('dictionary.vpc'),
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  alert: obj.provider === 'Aws' ? this.$t('network.vpc_aws_delete_alert') : null,
                })
              },
              meta: () => this.$getDeleteResult(obj),
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
    isPower (obj) {
      if (this.isAdminMode) return true
      if (this.isDomainMode) return obj.domain_id === this.userInfo.projectDomainId
      return obj.tenant_id === this.userInfo.projectId
    },
  },
}
