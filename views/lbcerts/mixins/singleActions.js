import { mapGetters } from 'vuex'
import i18n from '@/locales'
import { getSetPublicAction } from '@/utils/common/tableActions'

export default {
  created () {
    this.singleActions = [
      {
        label: i18n.t('network.text_225', [i18n.t('dictionary.project')]),
        permission: 'networks_perform_change_owner',
        action: (obj) => {
          this.createDialog('ChangeOwenrDialog', {
            data: [obj],
            columns: this.columns,
            name: this.$t('network.text_142'),
            onManager: this.onManager,
            resource: 'loadbalancercertificates',
          })
        },
        meta: (obj) => {
          const ret = {
            validate: false,
            tooltip: '',
          }
          if (this.isProjectMode) {
            ret.tooltip = i18n.t('monitor.text_9', [this.$t('dictionary.domain')])
            return ret
          }
          if (obj.is_public && obj.public_scope !== 'none') {
            ret.validate = false
            ret.tooltip = this.$t('common_280')
            return ret
          }
          return {
            validate: this.isPower(obj),
          }
        },
      },
      getSetPublicAction(this, {
        name: this.$t('network.text_142'),
        scope: 'project',
        resource: 'loadbalancercertificates',
      }),
      {
        label: i18n.t('network.text_131'),
        permission: 'lb_loadbalancercertificates_delete',
        action: (obj) => {
          this.createDialog('DeleteResDialog', {
            vm: this,
            title: i18n.t('network.text_131'),
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            name: this.$t('network.text_143'),
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
    isPower (obj) {
      if (this.isAdminMode) return true
      if (this.isDomainMode) return obj.domain_id === this.userInfo.projectDomainId
      return obj.tenant_id === this.userInfo.projectId
    },
  },
}
