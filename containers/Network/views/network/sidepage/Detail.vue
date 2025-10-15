<template>
  <detail
    :on-manager="onManager"
    :data="data"
    :base-info="baseInfo"
    :extra-info="extraInfo"
    resource="networks"
    status-module="network"
    auto-hidden-columns-key="network_hidden_columns" />
</template>

<script>
import {
  getBrandTableColumn,
  getCopyWithContentTableColumn,
  getPublicScopeTableColumn,
} from '@/utils/common/tableColumn'
import {
  getUserTagColumn,
  getExtTagColumn,
} from '@/utils/common/detailColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'NetworkDetail',
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
    const extraInfo = [
      {
        title: this.$t('network.text_308'),
        items: ([
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
            field: 'wire',
            title: this.$t('network.text_571'),
            slots: {
              default: ({ row }) => {
                return [
                  <side-page-trigger permission='wires_get' name='WireSidePage' id={row.wire_id} vm={this}>{ row.wire }</side-page-trigger>,
                ]
              },
            },
          },
          {
            field: 'server_type',
            title: this.$t('network.text_574'),
            formatter: ({ cellValue }) => {
              if (cellValue === 'baremetal') {
                return this.$t('network.text_598')
              }
              if (cellValue === 'container') {
                return this.$t('network.text_599')
              }
              if (cellValue === 'guest') {
                return this.$t('network.text_226')
              }
              if (cellValue === 'eip') {
                return this.$t('network.text_221')
              }
              if (cellValue === 'hostlocal') {
                return 'HostLocal'
              }
              return this.$t('network.text_507')
            },
          },
          {
            field: 'bgp_type',
            title: this.$t('network.text_743'),
            formatter: ({ cellValue }) => {
              return cellValue || '-'
            },
          },
          {
            field: 'guest_ip_start',
            title: this.$t('network.ipv4.range'),
            formatter: ({ cellValue, row }) => {
              if (!row.guest_ip_start || !row.guest_ip_end) {
                return '-'
              }
              return `${cellValue} - ${row.guest_ip_end}/${row.guest_ip_mask}`
            },
          },
          getCopyWithContentTableColumn({
            field: 'guest_gateway',
            title: this.$t('network.ipv4.gateway'),
          }),
          {
            field: 'guest_ip6_start',
            title: this.$t('network.ipv6.range'),
            formatter: ({ cellValue, row }) => {
              if (!row.guest_ip6_start || !row.guest_ip6_end) {
                return '-'
              }
              return `${cellValue} - ${row.guest_ip6_end}/${row.guest_ip6_mask}`
            },
          },
          getCopyWithContentTableColumn({
            field: 'guest_gateway6',
            title: this.$t('network.ipv6.gateway'),
          }),
          {
            field: 'guest_dhcp',
            title: 'dhcp_relay',
            slots: {
              default: ({ row }) => {
                const ips = (row.guest_dhcp || '').split(',')
                if (!ips.length) return '-'
                const ret = ips.map(item => {
                  const obj = { ip: item }
                  return <list-body-cell-wrap copy field='ip' row={obj} hideField={true} message={item}>
                    {item}
                  </list-body-cell-wrap>
                })
                return ret
              },
            },
          },
          {
            field: 'vlan_id',
            title: 'VLAN ID',
            formatter: ({ cellValue }) => {
              return cellValue || '-'
            },
          },
          {
            field: 'ports',
            title: this.$t('network.text_622'),
            slots: {
              default: ({ row }) => {
                return [
                  <i18n path='network.text_735' tag="div">
                    <template slot='ports'>{ row.ports }</template>
                    <template slot='ports_used'>
                      { row.ports_used + row.ports6_used <= 0 ? 0 : <a onClick={ () => this.$emit('tab-change', 'i-p-list') }>{row.ports_used + row.ports6_used}</a> }
                    </template>
                    <template slot='reserve_vnics'>{ row.reserve_vnics }</template>
                  </i18n>,
                ]
              },
            },
          },
          {
            field: 'guest_dns',
            title: this.$t('network.dns_server'),
          },
          {
            field: 'guest_domain',
            title: this.$t('network.text_586'),
            formatter: ({ cellValue }) => {
              return cellValue || '-'
            },
          },
        ]).filter(item => {
          if (['wire', 'server_type', 'bgp_type', 'guest_dhcp', 'vlan_id'].indexOf(item.field) >= 0) {
            if (this.data.cloud_env === 'onpremise' && (this.data.is_classic || this.data.is_default_vpc)) {
              return true
            }
            return false
          }
          return !this.$isScopedPolicyMenuHidden(`network_hidden_columns.${item.field}`)
        }),
      },
    ]
    if (this.data.cloud_env === 'onpremise') {
      if (this.data.metadata && this.data.metadata.static_routes) {
        extraInfo[0].items.push({
          title: this.$t('network.static_routes'),
          slots: {
            default: ({ row }) => {
              const routes = JSON.parse(row.metadata.static_routes)
              console.log(routes)
              const comps = []
              return comps
            },
          },
        })
      }
    }
    if (this.data.cloud_env === 'onpremise' && this.$store.getters.capability && this.$store.getters.capability.brands && this.$store.getters.capability.brands.includes('VMware')) {
      extraInfo.push({
        title: this.$t('network.vmware_extra_info'),
        items: [
          {
            field: 'additional_wires',
            title: () => {
              return [
                this.$t('network.additional_wires.title'),
                <help-tooltip class="ml-1" text={ this.$t('network.additional_wires.title.tooltip') } />,
              ]
            },
            slots: {
              default: ({ row }) => {
                let comps = []
                const link = <span class='wire-edit' onclick={this.setWireHandle}>
                  <a-icon class='mr-1' type="edit" style="font-size: 12px;" />{ this.$t('common.setting') }</span>
                if (!row.additional_wires) {
                  comps.push(link)
                  return comps
                }
                comps = row.additional_wires.map((item, idx) => {
                  return <side-page-trigger permission='wires_get' name='WireSidePage' id={item.wire_id} vm={this}>{ item.wire }{ idx < row.additional_wires.length - 1 ? ',' : '' }</side-page-trigger>
                })
                comps.push(link)
                return comps
              },
            },
          },
        ],
      })
    }
    return {
      baseInfo: [
        getUserTagColumn({
          onManager: this.onManager,
          resource: 'network',
          columns: () => this.columns,
          tipName: this.$t('dictionary.network'),
          editCheck: (row) => (row.provider || '').toLowerCase() !== 'bingocloud',
        }),
        getExtTagColumn({
          onManager: this.onManager,
          resource: 'network',
          columns: () => this.columns,
          tipName: this.$t('dictionary.network'),
          editCheck: (row) => (row.provider || '').toLowerCase() !== 'bingocloud',
        }),
        getPublicScopeTableColumn({ vm: this, resource: 'networks' }),
        getBrandTableColumn(),
        {
          field: 'schedtag',
          title: this.$t('network.text_630'),
          formatter: ({ cellValue, row }) => {
            if (row.schedtags && row.schedtags.length > 0) {
              const schedtags = row.schedtags.map(v => v.name)
              return schedtags.join('，')
            }
            return '-'
          },
        },
      ],
      extraInfo: extraInfo,
    }
  },
  methods: {
    setWireHandle () {
      this.createDialog('SetAdditionalWiresDialog', {
        currentData: this.data,
        success: () => {
          this.$emit('refresh')
        },
      })
    },
  },
}
</script>
<style lang="scss" scoped>
.wire-edit {
  padding: 0 6px 0 4px;
  margin-left: 10px;
  font-size: 12px;
  line-height: 20px;
  border: 1px dashed #97a4b6;
  cursor: pointer;
}
</style>
