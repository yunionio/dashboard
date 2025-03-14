<template>
  <event-drawer id="CachedImageEventList" :resId="resId" :getParams="getParams" />
</template>

<script>
export default {
  name: 'CachedImageEventList',
  props: {
    resId: {
      type: String,
    },
    getParams: [Object, Function],
  },
}
</script>
