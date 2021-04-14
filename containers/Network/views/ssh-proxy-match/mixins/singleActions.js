import { mapGetters } from 'vuex'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('network.ssh-proxy-match.unlink'),
        permission: 'sshproxy_match_unlink',
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: i18n.t('network.ssh-proxy-match.unlink'),
            name: this.$t('network.ssh-proxy.match'),
            onManager: this.onManager,
          })
        },
        meta: obj => {
          if (!this.isPower(obj)) {
            return {
              validate: false,
              tooltip: i18n.t('network.text_627'),
            }
          }
          if (!this.$getDeleteResult(obj).validate) {
            return {
              validate: false,
              tooltip: this.$getDeleteResult(obj).tooltip,
            }
          }
          return {
            validate: true,
            tooltip: '',
          }
        },
      }]
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
