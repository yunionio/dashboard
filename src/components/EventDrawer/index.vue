<template>
  <event-list :obj-id="resId" :obj-type="resType" :list-id="id" :getParams="getParams" :enableVirtualScroll="enableVirtualScroll" />
</template>

<script>
import EventList from '@/sections/EventList'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'EventDrawer',
  components: {
    EventList,
  },
  mixins: [WindowsMixin],
  props: {
    id: {
      type: String,
    },
    resId: {
      type: String,
    },
    resType: {
      type: String,
    },
    enableVirtualScroll: {
      type: Boolean,
      default: false,
    },
    getParams: [Object, Function],
  },
}
</script>
