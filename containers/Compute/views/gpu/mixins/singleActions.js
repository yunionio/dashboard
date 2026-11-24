import { isUpdatableGpuType } from '@Compute/constants'
import i18n from '@/locales'
import { getSetPublicAction } from '@/utils/common/tableActions'

export default {
  created () {
    this.singleActions = this.buildPassthroughSingleActions()
  },
  methods: {
    buildUpdateGpuModeAction () {
      return {
        key: 'UpdateDeviceType',
        label: this.$t('gpu.device_type.update'),
        action: obj => {
          this.createDialog('UpdateDeviceTypeDialog', {
            data: [obj],
            columns: this.columns,
            refresh: this.refresh,
          })
        },
        meta: obj => {
          const ret = { validate: true }
          if (obj.dev_type.indexOf('GPU') === -1) {
            ret.validate = false
            ret.tooltip = this.$t('gpu.device_type.update.validate')
            return ret
          }
          if (!isUpdatableGpuType(obj)) {
            ret.validate = false
            ret.tooltip = this.$t('gpu.device_type.tooltip.check_hpc_vga_gpu')
            return ret
          }
          return ret
        },
      }
    },
    buildManageInstancesAction () {
      return {
        label: this.$t('compute.text_1028_1'),
        permission: 'server_perform_attach_isolated_device',
        action: (obj) => {
          this.sidePageTriggerHandle(this, 'GpuSidePage', {
            id: obj.id,
            resource: 'isolated_devices',
          }, { tab: 'associated-instances' })
        },
      }
    },
    buildPassthroughMoreActions ({ leadingActions = [], includeManageInstances = false } = {}) {
      const manageAction = this.buildManageInstancesAction()
      const setReserveAction = {
        key: 'SetReserveResource',
        label: i18n.t('compute.text_490'),
        permission: 'isolated_devices_update',
        action: obj => {
          this.createDialog('SetReserveResourceDialog', {
            onManager: this.onManager,
            data: [obj],
            columns: this.columns,
            refresh: this.refresh,
          })
        },
        meta: obj => {
          const { dev_type } = obj
          if (!dev_type) {
            return { validate: false }
          }
          if (dev_type.indexOf('GPU') === -1) {
            return {
              validate: false,
              tooltip: this.$t('compute.text_1398', [dev_type]),
            }
          }
          return { validate: true }
        },
      }
      return {
        label: this.$t('common.more'),
        actions: () => {
          const items = [...leadingActions]
          items.push(getSetPublicAction(this, {
            name: this.$t('compute.text_113'),
            scope: 'project',
            resource: 'isolated_devices',
          }, {
            permission: 'isolated_devices_perform_public',
          }))
          if (includeManageInstances) {
            items.push(manageAction)
          }
          items.push(setReserveAction)
          return items
        },
      }
    },
    buildPassthroughSingleActions () {
      const updateAction = this.buildUpdateGpuModeAction()
      const manageAction = this.buildManageInstancesAction()
      const guestVmList = this.guestVmPassthroughListActions === true
      if (guestVmList) {
        return [
          updateAction,
          this.buildPassthroughMoreActions({ includeManageInstances: true }),
        ]
      }
      return [
        manageAction,
        this.buildPassthroughMoreActions(),
      ]
    },
  },
}
