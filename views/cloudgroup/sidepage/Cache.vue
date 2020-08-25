<template>
  <cloudgroupcache-list
    id="CloudgroupcacheListForCloudgroupSidepage"
    :get-params="getParams"
    :is-owner="isOwner" />
</template>

<script>
import CloudgroupcacheList from '@Cloudenv/views/cloudgroupcache/components/List'

export default {
  name: 'CloudgroupcacheListForCloudgroupSidepage',
  components: {
    CloudgroupcacheList,
  },
  props: {
    getParams: [Function, Object],
    data: Object,
  },
  methods: {
    isOwner () {
      return this.$store.getters.isAdminMode || (this.data && this.data.domain_id === this.$store.getters.userInfo.projectDomainId)
    },
  },
}
</script>
