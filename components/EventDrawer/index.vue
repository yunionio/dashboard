<template>
  <event-list :obj-id="resId" :obj-type="resType" />
</template>

<script>
import EventList from '@/sections/EventList'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'EventDrawer',
  components: {
    EventList,
  },
  mixins: [SidePageMixin, WindowsMixin],
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
