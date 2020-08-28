<template>
  <detail
    :data="data"
    :extra-info="extraInfo"
    :base-info="baseInfo"
    status-module="server"
    :on-manager="onManager" />
</template>

<script>
// import { ALL_STORAGE } from '@Compute/constants/index'
import {
  getCopyWithContentTableColumn,
  getBrandTableColumn,
  getSwitchTableColumn,
} from '@/utils/common/tableColumn'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'BaremetalDetail',
  mixins: [WindowsMixin],
  props: {
    onManager: {
      type: Function,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      baseInfo: [
        {
          field: 'keypair',
          title: this.$t('compute.text_33'),
        },
        getBrandTableColumn(),
      ],
    }
  },
  computed: {
    diskInfos () {
      const disksInfo = this.data.disks_info
      if (!disksInfo) return {}
      const dataDisk = {}
      const sysDisk = {}
      let image = '-'
      let imageId
      let sysDisks = disksInfo.filter(v => v.disk_type === 'sys')
      if (sysDisks && sysDisks.length === 0) {
        sysDisks = disksInfo.filter(v => v.index === 0)
      }
      const dataDisks = disksInfo.filter(v => v.index !== 0)
      if (sysDisks && sysDisks.length > 0) {
        const sysKey = sysDisks[0].storage_type
        image = sysDisks[0].image || '-'
        imageId = sysDisks[0].image_id
        sysDisk[sysKey] = this._dealSize(sysDisks)
      }
      if (dataDisks && dataDisks.length > 0) {
        const dataKey = dataDisks[0].storage_type
        dataDisk[dataKey] = this._dealSize(dataDisks)
        // for (let k in ALL_STORAGE) {
        //   const e = ALL_STORAGE[k]
        //   const sameType = dataDisks.filter(v => v.storage_type === e.value)
        //   if (sameType && sameType.length) {
        //     dataDisk[k] = this._dealSize(sameType)
        //   }
        // }
      }
      if (this.data.cdrom && dataDisks.length > 0) {
        image = dataDisks[0].image
        imageId = dataDisks[0].image_id
      }
      return {
        sysDisk: this._diskStringify(sysDisk) || '-',
        dataDisk: this._diskStringify(dataDisk) || '-',
        image,
        imageId,
      }
    },
    extraInfo () {
      return [
        {
          title: this.$t('compute.text_368'),
          items: [
            {
              field: 'os_type',
              title: this.$t('compute.text_267'),
              formatter: ({ row }) => {
                const distribution = (row.metadata && row.metadata.os_distribution) ? row.metadata.os_distribution : row.os_type
                const { os_version: version = '' } = row.metadata || {}
                return distribution + version
              },
            },
            getCopyWithContentTableColumn({ field: 'ips', title: 'IP' }),
            getCopyWithContentTableColumn({
              field: 'image',
              title: this.$t('compute.text_97'),
              hideField: true,
              message: this.diskInfos.image,
              slotCallback: row => {
                if (this.diskInfos.image) {
                  return [<side-page-trigger onTrigger={ () => this.handleOpenSystemImageDetail(this.diskInfos.imageId) }>{ this.diskInfos.image }</side-page-trigger>]
                }
                return '-'
              },
            }),
            {
              field: 'vcpu_count',
              title: 'CPU',
              formatter: ({ row }) => {
                return row.vcpu_count + this.$t('compute.text_167')
              },
            },
            {
              field: 'vmem_size',
              title: this.$t('compute.text_369'),
              formatter: ({ row }) => {
                return (row.vmem_size / 1024) + 'GB'
              },
            },
            {
              field: 'sysDisk',
              title: this.$t('compute.text_49'),
              formatter: ({ row }) => {
                if (this.diskInfos.sysDisk) return <a onClick={ () => this.$emit('tab-change', 'disk-list-for-baremetal-sidepage') }>{this.diskInfos.sysDisk}</a>
                return '-'
              },
            },
            {
              field: 'dataDisk',
              title: this.$t('compute.text_50'),
              formatter: ({ row }) => {
                if (this.diskInfos.dataDisk) return <a onClick={ () => this.$emit('tab-change', 'disk-list-for-baremetal-sidepage') }>{this.diskInfos.dataDisk}</a>
                return '-'
              },
            },
            getCopyWithContentTableColumn({
              field: 'cdrom',
              title: 'ISO',
              hideField: true,
              slotCallback: row => {
                if (!row.cdrom) return '-'
                const idx = row.cdrom.indexOf('(')
                const id = row.cdrom.substring(idx + 1, row.cdrom.indexOf('/'))
                return [
                  <side-page-trigger permission='images_get' name='SystemImageSidePage' id={id} vm={this}>{ row.cdrom.substring(0, idx) || '-' }</side-page-trigger>,
                ]
              },
            }),
            {
              field: 'isolated_devices',
              title: 'GPU',
              formatter: ({ row }) => {
                if (!row.isolated_devices) return '-'
                const gpuArr = row.isolated_devices
                const obj = {}
                const ids = {}
                gpuArr.forEach(val => {
                  if (!obj[val.model]) {
                    obj[val.model] = 1
                  } else {
                    obj[val.model] += 1
                  }
                  ids[val.model] = val.id
                })
                return Object.keys(obj).map(k => {
                  return <side-page-trigger permission='isolated_devices_get' name='GpuSidePage' id={ids[k]} vm={this}>{this.$t('compute.text_370', [obj[k], k])}</side-page-trigger>
                })
              },
            },
            getCopyWithContentTableColumn({
              field: 'host',
              title: this.$t('compute.text_112'),
              hideField: true,
              slotCallback: row => {
                if (!row.host) return '-'
                return [
                  <side-page-trigger permission='hosts_get' name='PhysicalmachineSidePage' id={row.host_id} vm={this}>{ row.host }</side-page-trigger>,
                ]
              },
              hidden: () => this.$store.getters.isProjectMode,
            }),
            getCopyWithContentTableColumn({ field: 'host_sn', title: 'SN' }),
          ],
        },
        {
          title: this.$t('compute.text_371'),
          items: [
            getSwitchTableColumn({
              field: 'disable_delete',
              title: this.$t('compute.text_372'),
              change: val => {
                this.onManager('update', {
                  id: this.data.id,
                  managerArgs: {
                    data: { disable_delete: val },
                  },
                })
              },
            }),
          ],
        },
      ]
    },
  },
  created () {},
  methods: {
    _diskStringify (diskObj) {
      let str = ''
      // const storageArr = Object.values(ALL_STORAGE)
      for (const k in diskObj) {
        const num = diskObj[k]
        // const disk = storageArr.find(v => v.value === k)
        // if (disk) {
        //   str += `、${parseInt(num / 1024)}GB（裸金属}）`
        // }
        if (num < 0) {
          str += this.$t('compute.text_373')
        } else {
          str += this.$t('compute.text_374', [parseInt(num / 1024)])
        }
      }
      return str.slice(1)
    },
    _dealSize (sameType) {
      const sameType1 = sameType.map(v => {
        const size = +v.size
        return size
      })
      return sameType1.reduce((a, b) => {
        return a + b
      })
    },
    handleOpenSystemImageDetail (id) {
      this.$emit('init-side-page-tab', 'system-image-detail')
      this.$emit('side-page-trigger-handle', this, 'SystemImageSidePage', {
        id,
        resource: 'images',
        apiVersion: 'v1',
        steadyStatus: Object.values(expectStatus.image).flat(),
      }, {
        cancel: () => {
          this.$emit('single-refresh', this.data.id)
        },
      })
    },
  },
}
</script>
