<template>
  <detail
    :data="data"
    :onManager="onManager"
    status-module="cloudgroup" />
</template>

<script>
export default {
  name: 'CloudgroupDetail',
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
