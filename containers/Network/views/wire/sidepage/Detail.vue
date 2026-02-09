<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    resource="wires" />
</template>

<script>
import { getBrandTableColumn, getCopyWithContentTableColumn, getPublicScopeTableColumn } from '@/utils/common/tableColumn'
import {
  getUserTagColumn,
  getExtTagColumn,
} from '@/utils/common/detailColumn'
import WindowsMixin from '@/mixins/windows'
import { getBandwidthTableColumn, getMTUTableColumn } from '../utils/columns'

export default {
  name: 'WireDetail',
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
    columns: Array,
  },
  data () {
    const extraInfo = []
    if (this.data && this.data.metadata && this.data.metadata['sys:datacenter']) {
      extraInfo.push({
        title: this.$t('network.vmware_extra_info'),
        items: [
          {
            field: 'metadata',
            title: this.$t('network.vmware_datacenter_prompt'),
            slots: {
              default: ({ row }, h) => {
                return [
                  <span>{row.metadata['sys:datacenter']}</span>,
                ]
              },
            },
          },
          {
            field: 'metadata',
            title: this.$t('network.vmware_vm_ips_prompt'),
            slots: {
              default: ({ row }, h) => {
                return [
                  <span>{row.metadata['sys:vm_ips']}</span>,
                ]
              },
            },
          },
          {
            field: 'metadata',
            title: this.$t('network.vmware_vm_macs_prompt'),
            slots: {
              default: ({ row }, h) => {
                return [
                  <span>{row.metadata['sys:vm_macs']}</span>,
                ]
              },
            },
          },
        ],
      })
    }
    return {
      baseInfo: [
        getUserTagColumn({ onManager: this.onManager, resource: 'wire', columns: () => this.columns, tipName: this.$t('dictionary.hostwire') }),
        getExtTagColumn({ onManager: this.onManager, resource: 'wire', columns: () => this.columns, tipName: this.$t('dictionary.hostwire') }),
        getPublicScopeTableColumn({ vm: this, resource: 'wires' }),
        getBrandTableColumn(),
        getBandwidthTableColumn(),
        getMTUTableColumn(),
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
          field: 'networks',
          title: this.$t('network.text_565'),
          slots: {
            default: ({ row }, h) => {
              if (!row.networks) return row.networks || 0
              return [
                <a onClick={ () => this.$emit('tab-change', 'network-list') }>{row.networks}</a>,
              ]
            },
          },
        },
        getCopyWithContentTableColumn({
          field: 'region',
          title: this.$t('network.text_199'),
          hideField: true,
          slotCallback: row => {
            if (!row.region) return '-'
            return [
              <side-page-trigger permission='areas_get' name='CloudregionSidePage' id={row.region_id} vm={this}>{ row.region }</side-page-trigger>,
            ]
          },
        }),
      ],
      extraInfo: extraInfo,
    }
  },
}
</script>
