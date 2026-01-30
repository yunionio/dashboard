<template>
  <secgroup-list
    ref="secgroupList"
    :hiddenActions="['openSecgroupSidepageTab']"
    :hiddenColumns="['guest_cnt']"
    :hiddenSidepageTabs="['associated-instances']"
    :id="id"
    :getParams="getParams"
    :show-create-action="false"
    :customSingleActions="customSingleActions"
    frontGroupMethods="coverage"
    :frontGroupActions="frontGroupActions" />
</template>

<script>
import SecgroupList from '@Compute/views/secgroup/components/List'
import WindowsMixin from '@/mixins/windows'
import { SECGROUP_LIST_FOR_VMINSTANCE_SIDEPAGE_REFRESH } from '@/constants/event-bus'

export default {
  name: 'VmSecgroupListForVminstanceSidepage',
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
              this.createDialog('VmSetSecgroupDialog', {
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
              this.createDialog('VmSidepageRevokeSecgroupDialog', {
                detailData: that.data,
                data: this.list.selectedItems,
                onManager: this.onManager,
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
              if (this.list.selectedItems.length === this.list.total) {
                ret.validate = false
                ret.tooltip = this.$t('compute.secgroup.remove_secgroup.group_actions.tooltip')
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
            this.createDialog('VmSidepageRevokeSecgroupDialog', {
              detailData: this.data,
              data: [obj],
              onManager: this.onManager,
              refresh: () => {
                this.$bus.$emit(SECGROUP_LIST_FOR_VMINSTANCE_SIDEPAGE_REFRESH)
              },
            })
          },
          meta: () => {
            const ret = { validate: true }
            if (this.$refs.secgroupList?.list?.total === 1) {
              ret.validate = false
              ret.tooltip = this.$t('compute.secgroup.remove_secgroup.single_actions.tooltip')
              return ret
            }
            return ret
          },
        },
      ],
    }
  },
  created () {
    this.$bus.$on(SECGROUP_LIST_FOR_VMINSTANCE_SIDEPAGE_REFRESH, () => {
      const secgroupListVm = this.$refs.secgroupList
      secgroupListVm && secgroupListVm.refresh()
    })
  },
}
</script>
