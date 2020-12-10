import { mapGetters } from 'vuex'
import { getDomainChangeOwnerAction, getSetPublicAction } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'isProjectMode', 'userInfo']),
  },
  created () {
    this.singleActions = [
      {
        label: i18n.t('network.text_606'),
        permission: 'wires_update',
        action: obj => {
          this.createDialog('WireUpdateDialog', {
            data: [obj],
            columns: this.columns,
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
        meta: obj => {
          return {
            validate: this.isPower(obj),
          }
        },
      },
      {
        label: i18n.t('network.text_129'),
        actions: obj => {
          return [
            getDomainChangeOwnerAction(this, {
              name: this.$t('dictionary.wire'),
              resource: 'wires',
            }),
            getSetPublicAction(this, {
              name: this.$t('dictionary.wire'),
              scope: 'domain',
              resource: 'wires',
            }, {
              permission: 'wires_perform_public',
              meta: () => {
                return {
                  validate: this.isPower(obj),
                }
              },
            }),
            {
              label: i18n.t('network.text_131'),
              permission: 'wires_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: i18n.t('network.text_131'),
                  name: this.$t('dictionary.hostwire'),
                  onManager: this.onManager,
                })
              },
              meta: () => this.$getDeleteResult(obj),
            },
          ]
        },
      },
    ]
  },
  methods: {
    isPower (obj) {
      if (this.isAdminMode) return true
      if (this.isDomainMode) return obj.domain_id === this.userInfo.projectDomainId
      return obj.tenant_id === this.userInfo.projectId
    },
  },
}
