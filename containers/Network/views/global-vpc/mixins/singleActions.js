import { mapGetters } from 'vuex'
import { getDomainChangeOwnerAction, getSetPublicAction } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('network.text_201'),
        permission: 'network_globalvpcs_perform_syncstatus',
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
              name: this.$t('dictionary.globalvpc'),
              resource: 'globalvpcs',
            }, {
              permission: 'network_globalvpcs_perform_change_owner',
            }),
            getSetPublicAction(this, {
              name: this.$t('dictionary.globalvpc'),
              scope: 'domain',
              resource: 'globalvpcs',
            }, {
              permission: 'network_globalvpcs_perform_public',
            }),
            {
              label: i18n.t('network.text_131'),
              permission: 'network_globalvpcs_delete',
              action: (obj) => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  name: this.$t('dictionary.globalvpc'),
                  title: i18n.t('network.text_131'),
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  // alert: '提示：请确保存储桶下所有目录和文件已删空，删除后数据不可恢复和访问。',
                })
              },
              meta: obj => this.$getDeleteResult(obj),
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
      return false
    },
  },
}
