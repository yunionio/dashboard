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
            label: this.$t('compute.text_1116'),
            action: () => {
              this.createDialog('VmSetNetworkSecgroupDialog', {
                vm: this,
                data: [that.data],
                columns: that.serverColumns,
                manager: new that.$Manager('servers'),
              })
            },
          },
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
