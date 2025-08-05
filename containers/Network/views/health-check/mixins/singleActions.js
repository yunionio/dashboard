import { mapGetters } from 'vuex'
import i18n from '@/locales'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('table.action.modify'),
        permission: 'loadbalancer_health_checks_update',
        action: (obj) => {
          this.createDialog('HealthCheckCreateDialog', {
            onManager: this.onManager,
            data: [obj],
            type: 'update',
          })
        },
      },
      {
        label: i18n.t('network.text_131'),
        permission: 'loadbalancer_health_checks_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            title: i18n.t('network.text_131'),
            name: this.$t('network.ssl_certificate'),
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
          })
        },
        meta: (obj) => this.$getDeleteResult(obj),
      },
    ]
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo']),
  },
  methods: {
  },
}
