<template>
  <secgroup-list
    :hiddenActions="['openSecgroupSidepageTab']"
    :hiddenColumns="['guest_cnt']"
    :hiddenSidepageTabs="['vminstance-list']"
    :id="id"
    :getParams="getParams"
    :show-create-action="false" />
</template>

<script>
import SecgroupList from '@Compute/views/secgroup/components/List'

export default {
  name: 'SecgroupListForVminstanceSidepage',
  components: {
    SecgroupList,
  },
  props: {
    id: String,
    getParams: [Function, Object],
  },
}
</script>
