<template>
  <secgroup-list
    ref="secgroupList"
    :hiddenActions="['openSecgroupSidepageTab']"
    :hiddenColumns="['guest_cnt']"
    :hiddenSidepageTabs="['vminstance-list']"
    :id="id"
    :getParams="getParams"
    :show-create-action="false" />
</template>

<script>
import SecgroupList from '@Compute/views/secgroup/components/List'
import { SECGROUP_LIST_FOR_VMINSTANCE_SIDEPAGE_REFRESH } from '@/constants/event-bus'

export default {
  name: 'SecgroupListForVminstanceSidepage',
  components: {
    SecgroupList,
  },
  props: {
    id: String,
    getParams: [Function, Object],
  },
  created () {
    this.$bus.$on(SECGROUP_LIST_FOR_VMINSTANCE_SIDEPAGE_REFRESH, () => {
      const secgroupListVm = this.$refs.secgroupList
      secgroupListVm && secgroupListVm.refresh()
    })
  },
}
</script>
