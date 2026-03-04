<template>
  <div>
    <a-alert type="warning" class="mb-2" :message="$t('compute.nic_secgroups_tips')" />
    <secgroup-list
      ref="netSecgroupList"
      :hiddenActions="['openSecgroupSidepageTab']"
      :hiddenColumns="['guest_cnt', 'status']"
      :extraColumns="extraColumns"
      :hiddenSidepageTabs="['associated-instances']"
      :id="id"
      :getParams="getParams"
      :show-create-action="false"
      :customSingleActions="customSingleActions"
      frontGroupMethods="coverage"
      :frontGroupActions="frontGroupActions"
      secgroupType="network" />
  </div>
</template>

<script>
import SecgroupList from '@Compute/views/secgroup/components/List'
import WindowsMixin from '@/mixins/windows'
import { SECGROUP_LIST_FOR_VMINSTANCE_SIDEPAGE_REFRESH } from '@/constants/event-bus'
import { getCopyWithContentTableColumn } from '@/utils/common/tableColumn'

export default {
  name: 'NetworkSecgroupListForVminstanceSidepage',
  components: {
    SecgroupList,
  },
  mixins: [WindowsMixin],
  props: {
    id: String,
    data: Object,
    getParams: [Function, Object],
    serverColumns: {
      type: Array,
      default () {
        return []
      },
    },
  },
  data () {
    const that = this
    return {
      frontGroupActions: function () {
        return [
          {
            label: this.$t('common.remove'),
            action: () => {
              const nics = that.data.nics || []
              const mac = nics.length > 0 ? nics[0].mac : null
              if (!mac) {
                this.$message.warning(this.$t('compute.text_193'))
                return
              }
              this.createDialog('VmSidepageRevokeNetworkSecgroupDialog', {
                detailData: that.data,
                data: this.list.selectedItems,
                mac: mac,
                secgroupType: 'network',
                refresh: () => {
                  this.$bus.$emit(SECGROUP_LIST_FOR_VMINSTANCE_SIDEPAGE_REFRESH)
                },
              })
            },
            meta: () => {
              const ret = { validate: true }
              if (!this.list.selectedItems?.length) {
                ret.validate = false
                return ret
              }
              if (this.list.selectedItems.some(item => item.network_index !== this.list.selectedItems[0].network_index)) {
                ret.validate = false
                ret.tooltip = this.$t('compute.secgroup.remove_secgroup.group_actions.same_network_index_tooltip')
                return ret
              }
              return ret
            },
          },
        ]
      },
      customSingleActions: [
        {
          label: this.$t('common.remove'),
          action: (obj) => {
            const nics = this.data.nics || []
            const mac = nics.length > 0 ? nics[0].mac : null
            if (!mac) {
              this.$message.warning(this.$t('compute.text_193'))
              return
            }
            this.createDialog('VmSidepageRevokeNetworkSecgroupDialog', {
              detailData: this.data,
              data: [obj],
              mac: mac,
              secgroupType: 'network',
              refresh: () => {
                this.$bus.$emit(SECGROUP_LIST_FOR_VMINSTANCE_SIDEPAGE_REFRESH)
              },
            })
          },
        },
      ],
      extraColumns: [
        {
          field: 'network_index',
          title: this.$t('compute.network_index'),
          width: 80,
        },
        getCopyWithContentTableColumn({ field: 'ifname', title: this.$t('compute.text_384'), sortable: true }),
        getCopyWithContentTableColumn({ field: 'mac_addr', title: this.$t('compute.text_385'), sortable: true }),
        {
          field: 'ip_addr',
          title: this.$t('compute.text_386'),
          sortable: true,
          showOverflow: 'ellipsis',
          minWidth: 100,
          slots: {
            default: ({ row }, h) => {
              if (row.ip_addr) {
                const addrs = [
                  <div>{this.$t('compute.text_386')}: {row.ip_addr}/{row.guest_ip_mask}</div>,
                  <div>{this.$t('network.ipv4.gateway')}: {row.guest_gateway}</div>,
                ]
                if (row.mapped_ip_addr) {
                  addrs.push(<div>{this.$t('compute.vpc.mapped_addr')}: {row.mapped_ip_addr}</div>)
                }
                const ret = [
                  <a-popover>
                    <template slot="content">
                      {addrs}
                    </template>
                    <list-body-cell-wrap copy row={row} field="ip_addr" hideField={true}>
                      {row.ip_addr}/{row.guest_ip_mask}
                    </list-body-cell-wrap>
                  </a-popover>,
                ]
                return ret
              }
              return '-'
            },
          },
        },
        {
          field: 'ip6_addr',
          title: this.$t('compute.ipv6.address'),
          sortable: true,
          showOverflow: 'ellipsis',
          minWidth: 200,
          slots: {
            default: ({ row }, h) => {
              if (row.ip6_addr) {
                const addrs = [
                  <div>{this.$t('compute.ipv6.address')}: {row.ip6_addr}/{row.guest_ip6_mask}</div>,
                  <div>{this.$t('network.ipv6.gateway')}: {row.guest_gateway6}</div>,
                ]
                if (row.mapped_ip6_addr) {
                  addrs.push(<div>{this.$t('compute.vpc.mapped_addr')}: {row.mapped_ip6_addr}</div>)
                }
                const ret = [
                  <a-popover>
                    <template slot="content">
                      {addrs}
                    </template>
                    <list-body-cell-wrap copy row={row} field="ip6_addr" hideField={true}>
                      {row.ip6_addr}/{row.guest_ip6_mask}
                    </list-body-cell-wrap>
                  </a-popover>,
                ]
                return ret
              }
              return '-'
            },
          },
        },
        {
          field: 'network_id',
          title: this.$t('compute.text_106'),
          slots: {
            default: ({ row }) => {
              return [<side-page-trigger permission='networks_get' name='NetworkSidePage' id={row.network_id} vm={this}>{row.network_name}</side-page-trigger>]
            },
          },
        },
      ],
    }
  },
  created () {
    this.$bus.$on(SECGROUP_LIST_FOR_VMINSTANCE_SIDEPAGE_REFRESH, () => {
      const secgroupListVm = this.$refs.netSecgroupList
      secgroupListVm && secgroupListVm.refresh()
    })
  },
}
</script>
