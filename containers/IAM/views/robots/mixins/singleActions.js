import { mapGetters } from 'vuex'
import { getEnabledSwitchActions, getSetPublicAction } from '@/utils/common/tableActions'

export default {
  created () {
    this.singleActions = [
      {
        label: this.$t('table.action.modify'),
        action: (row) => {
          this.createDialog('CreateRobotDialog', {
            data: row,
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
        meta: (row) => {
          const ret = {
            validate: true,
            tooltip: null,
          }
          if (!this.isPower(row)) {
            ret.validate = false
            ret.tooltip = this.$t('system.robot.shared')
            return ret
          }
          return ret
        },
      },
      {
        label: this.$t('system.text_153'),
        actions: (row) => {
          return [
            getSetPublicAction(this, {
              name: this.$t('system.robot'),
              scope: 'domain',
              resource: 'robots',
              apiVersion: 'v1',
            }, {
              meta: (row) => {
                const ret = {
                  validate: true,
                  tooltip: null,
                }
                if (!this.isPower(row)) {
                  ret.validate = false
                  ret.tooltip = this.$t('system.robot.shared')
                  return ret
                }
                if (row.public_scope !== 'none') {
                  ret.validate = false
                  ret.tooltip = this.$t('system.robot.shared')
                  return ret
                }
                return ret
              },
            }),
            {
              label: this.$t('compute.perform_change_owner', [this.$t('dictionary.project')]),
              action: () => {
                this.createDialog('ChangeOwenrDialog', {
                  data: [row],
                  columns: this.columns,
                  onManager: this.onManager,
                  name: this.$t('system.robot'),
                  resource: 'robots',
                  apiVersion: 'v1',
                })
              },
              meta: () => {
                const ret = {
                  validate: true,
                  tooltip: null,
                }
                if (!this.isPower(row)) {
                  ret.validate = false
                  ret.tooltip = this.$t('system.robot.shared')
                  return ret
                }
                return ret
              },
            },
            ...getEnabledSwitchActions(this, row, undefined, {
              resourceName: this.$t('system.robot'),
              metas: [
                () => {
                  const ret = {
                    validate: true,
                    tooltip: null,
                  }
                  if (!this.isPower(row)) {
                    ret.validate = false
                    ret.tooltip = this.$t('system.robot.shared')
                    return ret
                  }
                  return ret
                },
                () => {
                  const ret = {
                    validate: true,
                    tooltip: null,
                  }
                  if (!this.isPower(row)) {
                    ret.validate = false
                    ret.tooltip = this.$t('system.robot.shared')
                    return ret
                  }
                  return ret
                },
              ],
            }),
            {
              label: this.$t('system.text_129'),
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [row],
                  columns: this.columns,
                  title: this.$t('system.text_129'),
                  name: this.$t('system.robot'),
                  onManager: this.onManager,
                })
              },
              meta: () => {
                const ret = {
                  validate: true,
                  tooltip: null,
                }
                if (!this.isPower(row)) {
                  ret.validate = false
                  ret.tooltip = this.$t('system.robot.shared')
                  return ret
                }
                return this.$getDeleteResult(row)
              },
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
      return obj.tenant_id === this.userInfo.projectId
    },
  },
}
