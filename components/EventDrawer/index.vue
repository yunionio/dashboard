<template>
  <event-list :obj-id="resId" />
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
      required: true,
    },
  },
  methods: {
  },
}
</script>
