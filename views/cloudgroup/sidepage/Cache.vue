<template>
  <cloudgroupcache-list
    id="CloudgroupcacheListForCloudgroupSidepage"
    :get-params="getParams" />
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
  },
}
</script>
