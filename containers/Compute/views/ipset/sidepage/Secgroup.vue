<template>
  <secgroup-list
    ref="secgroupList"
    :hiddenActions="['openSecgroupSidepageTab']"
    :hiddenColumns="['guest_cnt']"
    :hiddenSidepageTabs="['associated-instances']"
    :id="id"
    :getParams="getParams"
    :show-create-action="false" />
</template>

<script>
import SecgroupList from '@Compute/views/secgroup/components/List'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'SecgroupListForIpsetSidepage',
  components: {
    SecgroupList,
  },
  mixins: [WindowsMixin],
  props: {
    id: String,
    data: Object,
    getParams: [Function, Object],
  },
}
</script>
