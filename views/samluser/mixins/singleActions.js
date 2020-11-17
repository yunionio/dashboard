import { mapGetters } from 'vuex'
import i18n from '@/locales'

export default {
  computed: {
    ...mapGetters(['isAdminMode', 'userInfo']),
  },
  created () {
    this.singleActions = [
      {
        label: i18n.t('table.action.delete'),
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: i18n.t('table.action.delete'),
            name: this.$t('res.samluser'),
            onManager: this.onManager,
          })
        },
        meta: (obj) => this.$getDeleteResult(obj),
      },
    ]
  },
  methods: {
    isNormalStatus () {
      let normalStatus = false
      if (
        this.cloudaccount &&
        this.cloudaccount.enabled &&
        this.cloudaccount.status === 'connected' &&
        this.cloudaccount.health_status === 'normal'
      ) {
        normalStatus = true
      }
      return normalStatus
    },
    isOwner () {
      return this.isAdminMode || (this.cloudaccount && this.cloudaccount.domain_id === this.userInfo.projectDomainId)
    },
  },
}
