<template>
  <event-list :obj-id="resId" :obj-type="resType" />
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
    resId: {
      type: String,
    },
    resType: {
      type: String,
    },
  },
}
</script>
