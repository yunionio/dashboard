<template>
  <detail
    :data="data"
    :onManager="onManager"
    status-module="cloudgroupcache"
    :is-edit-name="false"
    :show-desc="false" />
</template>

<script>
export default {
  name: 'CloudgroupcacheDetail',
  props: {
    onManager: {
      type: Function,
      required: true,
    },
    data: {
      type: Object,
      required: true,
    },
  },
}
</script>
