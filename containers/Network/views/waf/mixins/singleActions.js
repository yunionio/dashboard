import { mapGetters } from 'vuex'
// import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import i18n from '@/locales'
export default {
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'isDomainMode', 'userInfo', 'l3PermissionEnable']),
  },
  created () {
    this.singleActions = [
      {
        label: i18n.t('network.text_201'),
        action: (row) => {
          this.onManager('performAction', {
            steadyStatus: ['available', 'unavailable'],
            id: row.id,
            managerArgs: {
              action: 'syncstatus',
            },
          })
        },
      },
      {
        label: i18n.t('network.text_129'),
        actions: row => {
          return [
            {
              label: i18n.t('network.text_757'),
              action: () => {
                this.handleOpenSidepage(row, 'rule-manage')
              },
            },
            {
              label: i18n.t('network.text_758'),
              action: () => {
                this.handleOpenSidepage(row, 'resource-manage')
              },
            },
            {
              label: i18n.t('cloudenv.text_108'),
              permission: 'waf_instances_delete',
              action: () => {
                this.createDialog('DeleteWafInstancesDialog', {
                  data: [row],
                  columns: this.columns,
                  title: this.$t('network.waf.delete'),
                  name: this.$t('network.waf'),
                  onManager: this.onManager,
                })
              },
              meta: (row) => {
                const ret = {
                  validate: true,
                }
                return ret
              },
            },
          ]
        },
      }]
  },
}
