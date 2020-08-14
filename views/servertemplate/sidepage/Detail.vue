<template>
  <detail
    :on-manager="onManager"
    resource="servertemplates"
    status-module="servertemplate"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo" />
</template>

<script>
import * as R from 'ramda'
import { LOGIN_TYPES_MAP } from '@Compute/constants'
import { STORAGE_TYPES } from '@/constants/compute'
// import { HYPERVISORS_MAP } from '@/constants'
import { sizestrWithUnit } from '@/utils/utils'
import {
  getBrandTableColumn,
  getBillingTypeTableColumn,
  getCopyWithContentTableColumn,
  getTagTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ServertemplateDetail',
  mixins: [WindowsMixin],
  props: {
    data: {
      type: Object,
      required: true,
    },
    onManager: {
      type: Function,
      required: true,
    },
  },
  data () {
    const getDiskObj = (row, type) => {
      const { disks } = row.config_info
      const { hypervisor } = row.content
      const diskList = disks.filter(val => val.disk_type === type)
      if (!diskList.length) return ''
      const diskObj = STORAGE_TYPES[hypervisor][diskList[0].backend]
      const diskType = diskObj ? `（${diskObj.label}）` : ''
      const size = diskList.reduce((a, b) => a.size_mb + b.size_mb, { size_mb: 0 })
      return `${sizestrWithUnit(size, 'M', 1024)}${diskType}`
    }
    return {
      baseInfo: [
        {
          field: 'keypair',
          title: this.$t('compute.text_33'),
          formatter: ({ row }) => {
            return row.config_info.keypair || '-'
          },
        },
        getBrandTableColumn(),
        getBillingTypeTableColumn(),
      ],
      extraInfo: [
        {
          title: this.$t('compute.text_368'),
          items: [
            {
              field: 'os_type',
              title: this.$t('compute.text_267'),
            },
            getCopyWithContentTableColumn({
              field: 'image',
              title: this.$t('compute.text_97'),
              hideField: true,
              slotCallback: row => {
                if (!row.config_info || !row.config_info.image) return '-'
                return row.config_info.image
                // return [
                //   <side-page-trigger permission='images_get' name='SystemImageSidePage' id={this.diskInfos.imageId} vm={this}>{ row.config_info.image }</side-page-trigger>,
                // ]
              },
            }),
            getCopyWithContentTableColumn({
              field: 'vpc',
              title: 'VPC',
              hideField: true,
              slotCallback: row => {
                if (!row.vpc) return '-'
                return [
                  <side-page-trigger permission='vpcs_get' name='VpcSidePage' id={row.vpc_id} vm={this}>{ row.vpc }</side-page-trigger>,
                ]
              },
            }),
            {
              field: 'config_info.network',
              title: this.$t('compute.text_106'),
              slots: {
                default: ({ row }) => {
                  if (row.config_info.nets && row.config_info.nets.length) {
                    const _ = row.config_info.nets.map(net => {
                      if (net.guest_ip_start) {
                        return <div><a-tag>{ `${net.name}（${net.guest_ip_start} - ${net.guest_ip_end}, vlan=${net.vlan_id}）` }</a-tag></div>
                      }
                      return net.network || net.id
                    }).filter(v => !!v)
                    return _.length > 0 ? _ : this.$t('common_563')
                  }
                  return this.$t('common_563')
                },
              },
            },
            {
              field: 'config_info.secgroup',
              title: this.$t('compute.text_105'),
              formatter: ({ row }) => {
                if (row.secgroups && row.secgroups.length > 0) {
                  return row.secgroups.map(item => <a-tag>{item}</a-tag>)
                }
                return '-'
              },
            },
            {
              field: 'config_info.sys',
              title: this.$t('compute.text_49'),
              formatter: ({ row }) => {
                return getDiskObj(row, 'sys')
              },
            },
            {
              field: 'config_info.disk',
              title: this.$t('compute.text_50'),
              formatter: ({ row }) => {
                return getDiskObj(row, 'data')
              },
            },
            {
              field: 'config_info.cpu_core_count',
              title: 'CPU',
              formatter: ({ row }) => {
                const { sku } = row.config_info
                if (R.is(Object, sku)) {
                  return this.$t('compute.text_120', [sku.cpu_core_count || 0])
                }
                return '-'
              },
            },
            {
              field: 'config_info.memory_size_mb',
              title: this.$t('compute.text_369'),
              formatter: ({ row }) => {
                const { sku } = row.config_info
                if (R.is(Object, sku)) {
                  return sizestrWithUnit(sku.memory_size_mb, 'M', 1024)
                }
                return '-'
              },
            },
            {
              field: 'config_info.isolated_device_config',
              title: 'GPU',
              formatter: ({ row }) => {
                const gpu = row.isolated_device_config
                if (R.is(Object, gpu)) {
                  return `${gpu.vendor}/${gpu.model}`
                }
                return '-'
              },
            },
            {
              field: 'config_info.gcounts',
              title: this.$t('compute.text_1049'),
              formatter: ({ row }) => {
                return this.$t('compute.text_1050', [row.config_info.gcounts || 0])
              },
            },
            // {
            //   field: 'config_info.spec',
            //   title: '规格',
            //   formatter: ({ row }) => {
            //     const { hypervisor, sku } = row.config_info
            //     if (R.is(String, sku)) return sku
            //     const category = this.getI18NValue(`skuCategoryOptions['${hypervisor}']['${sku.instance_type_category}']`, sku.instance_type_category)
            //     return `${sku.name} (${category} ${sku.cpu_core_count}核 ${sizestrWithUnit(sku.memory_size_mb, 'M', 1024)})`
            //   },
            // },
            {
              field: 'config_info.reset_password',
              title: this.$t('compute.text_308'),
              formatter: ({ row }) => {
                if (row.config_info.reset_password === true) {
                  return LOGIN_TYPES_MAP.random.label
                }
                if (row.config_info.reset_password === false) {
                  return LOGIN_TYPES_MAP.image.label
                }
                return '-'
              },
            },
            getTagTableColumn({ field: 'config_info.metadata', resource: 'servertemplates', tipName: this.$t('dictionary.servertemplate') }),
          ],
        },
      ],
    }
  },
  methods: {
    getI18NValue (key, originVal) {
      if (this.$t(key)) {
        return this.$t(key)
      }
      return originVal
    },
  },
}
</script>
