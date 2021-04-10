import { mapGetters } from 'vuex'

export default {
  computed: {
    ...mapGetters(['isAdminMode', 'userInfo']),
  },
  created () {
    this.singleActions = [
      {
        label: this.$t('common.text00043'),
        permission: 'clouduser_perform_syncstatus',
        action: (obj) => {
          this.onManager('performAction', {
            id: obj.id,
            steadyStatus: ['available'],
            managerArgs: {
              action: 'syncstatus',
            },
          })
        },
        meta: () => {
          return {
            validate: this.isNormalStatus() && this.isOwner(),
          }
        },
      },
      {
        label: this.$t('common.more'),
        actions: obj => {
          return [
            {
              label: this.$t('cloudenv.clouduser_list_a2'),
              permission: 'clouduser_perform_change_owner',
              action: () => {
                this.createDialog('ClouduserChangeOwnerDialog', {
                  data: [obj],
                  onManager: this.onManager,
                  columns: this.columns,
                  cloudaccount: this.cloudaccount,
                })
              },
            },
            {
              label: this.$t('cloudenv.clouduser_list_a1'),
              permission: 'clouduser_perform_set_groups',
              action: () => {
                this.createDialog('ClouduserSetGroupsDialog', {
                  data: [obj],
                  onManager: this.onManager,
                  columns: this.columns,
                  cloudaccount: this.cloudaccount,
                  success: () => {
                    this.$bus.$emit('CloudgroupListForClouduserSidepageRefresh')
                  },
                })
              },
            },
            {
              label: this.$t('common.delete'),
              permission: 'clouduser_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: this.$t('common.delete'),
                  name: this.$t('dictionary.clouduser'),
                  onManager: this.onManager,
                })
              },
              meta: () => this.$getDeleteResult(obj),
            },
          ]
        },
        meta: () => {
          return {
            validate: this.isNormalStatus() && this.isOwner(),
          }
        },
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
