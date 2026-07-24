import { mapGetters } from 'vuex'
import { getSetPublicAction } from '@/utils/common/tableActions'

export default {
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'isProjectMode', 'userInfo']),
  },
  created () {
    this.singleActions = [
      {
        label: this.$t('compute.text_982'),
        permission: 'ipsets_update',
        action: obj => {
          this.createDialog('EditIpSetsDialog', {
            data: [obj],
            title: 'edit',
            columns: this.columns,
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
        meta: () => {
          return {
            validate: true,
          }
        },
      },
      {
        label: this.$t('compute.text_352'),
        actions: obj => {
          return [
            {
              label: this.$t('compute.perform_change_owner', [this.$t('dictionary.project')]),
              permission: 'ipsets_perform_change_owner',
              action: () => {
                this.createDialog('ChangeOwenrDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  refresh: this.refresh,
                  name: this.$t('compute.title.ipset'),
                  resource: 'ipsets',
                })
              },
              meta: () => {
                if (!this.isProjectMode) {
                  const isPower = this.isPower(obj)
                  const isPrivate = !obj.is_public
                  return {
                    validate: isPower && isPrivate,
                    tooltip: isPower && !isPrivate ? this.$t('compute.secgroup.shared') : '',
                  }
                }
                return {
                  tooltip: this.$t('compute.text_1336'),
                  validate: false,
                }
              },
            },
            getSetPublicAction(this, {
              name: this.$t('compute.title.ipset'),
              scope: 'project',
              resource: 'ipsets',
            }, {
              permission: 'ipsets_perform_public',
            }),
            {
              label: this.$t('compute.perform_delete'),
              permission: 'ipsets_delete',
              action: obj => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: this.$t('compute.perform_delete'),
                  name: this.$t('compute.title.ipset'),
                  onManager: this.onManager,
                  refresh: this.refresh,
                })
              },
              meta: (obj) => this.$getDeleteResult(obj),
            },
          ]
        },
      },
    ]
  },
  methods: {
    isPower (obj) {
      if (!obj.domain_id && obj.data.domain_id) {
        obj = obj.data
      }
      if (this.isAdminMode) return true
      if (this.isDomainMode) return obj.domain_id === this.userInfo.projectDomainId
      return obj.tenant_id === this.userInfo.projectId
    },
  },
}
