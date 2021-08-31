import { mapGetters } from 'vuex'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('network.text_349'),
        permission: 'proxy_endpoints_update',
        action: (obj) => {
          this.createDialog('UpdateSSHPortDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: this.$t('network.text_349'),
            name: this.$t('network.ssh-proxy.endpoints'),
            onManager: this.onManager,
          })
        },
      },
      {
        label: i18n.t('network.text_131'),
        permission: 'sshproxy_endpoint_delete',
        action: obj => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            data: [obj],
            columns: this.columns,
            title: i18n.t('network.text_131'),
            name: this.$t('network.ssh-proxy.endpoints'),
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
