import i18n from '@/locales'
import { GPU_DEV_TYPE_OPTION_MAP } from '@Compute/constants'
import { getSetPublicAction } from '@/utils/common/tableActions'
export default {
  created () {
    this.singleActions = [
      {
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
          const gpu_types = [GPU_DEV_TYPE_OPTION_MAP['GPU-HPC'].value, GPU_DEV_TYPE_OPTION_MAP['GPU-VGA'].value]
          if (!gpu_types.includes(obj.dev_type)) {
            ret.validate = false
            ret.tooltip = this.$t('gpu.device_type.tooltip.check_hpc_vga_gpu')
            return ret
          }
          return ret
        },
      },
      {
        label: this.$t('common.more'),
        actions: (obj) => {
          return [
            getSetPublicAction(this, {
              name: this.$t('compute.text_113'),
              scope: 'project',
              resource: 'isolated_devices',
            }, {
              permission: 'isolated_devices_perform_public',
            }),
            {
              label: this.$t('compute.text_1028_1'),
              permission: 'server_perform_attach_isolated_device',
              action: (obj) => {
                this.sidePageTriggerHandle(this, 'GpuSidePage', {
                  id: obj.id,
                  resource: 'isolated_devices',
                }, { tab: 'associated-instances' })
              },
            },
            {
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
            },
          ]
        },
      },
    ]
  },
}
