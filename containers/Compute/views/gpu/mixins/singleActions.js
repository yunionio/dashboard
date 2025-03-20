import i18n from '@/locales'
import { GPU_DEV_TYPE_OPTION_MAP } from '@Compute/constants'
import { cloudEnabled, cloudUnabledTip } from '@Compute/views/vminstance/utils'

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
        label: this.$t('compute.text_483', [this.$t('dictionary.server')]),
        permission: 'server_perform_attach_isolated_device',
        action: obj => {
          this.createDialog('AttachGpuDialog', {
            data: [obj],
            title: this.$t('compute.text_483', [this.$t('dictionary.server')]),
            columns: this.columns,
            refresh: this.refresh,
          })
        },
        meta: obj => {
          const ret = { validate: true }
          if (obj.dev_type === 'NIC') {
            ret.validate = false
            ret.tooltip = this.$t('compute.sriov_device_nic_notsupport')
            return ret
          }
          if (obj.guest_id) {
            ret.validate = false
            return ret
          }
          ret.validate = cloudEnabled('acttachGpu', obj)
          ret.tooltip = cloudUnabledTip('acttachGpu', obj)
          return ret
        },
      },
      {
        label: this.$t('compute.text_485', [this.$t('dictionary.server')]),
        permission: 'server_perform_detach_isolated_device',
        action: obj => {
          this.createDialog('DetachGpuDialog', {
            data: [obj],
            title: this.$t('compute.text_485', [this.$t('dictionary.server')]),
            columns: this.columns,
            refresh: this.refresh,
          })
        },
        meta: obj => {
          const ret = { validate: true }

          if (obj.dev_type === 'NIC') {
            ret.validate = false
            ret.tooltip = this.$t('compute.sriov_device_nic_notsupport')
            return ret
          }

          if (!obj.guest_id) {
            ret.validate = false
            ret.tooltip = this.$t('compute.text_487', [this.$t('dictionary.server')])
            return ret
          }

          if (obj.guest_status !== 'ready' && obj.guest_status !== 'running') {
            ret.validate = false
            ret.tooltip = this.$t('compute.text_489', [this.$t('dictionary.server')])
            return ret
          }
          ret.validate = cloudEnabled('acttachGpu', obj)
          ret.tooltip = cloudUnabledTip('acttachGpu', obj)
          return ret
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
}
