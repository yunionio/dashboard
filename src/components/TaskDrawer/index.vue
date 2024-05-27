<template>
  <task-list
    resource="cloud-phone-tasks"
    :isRoot="true"
    :obj-id="resId"
    :list-id="id"
    :getParams="getParams" />
</template>

<script>
import TaskList from '@/sections/TaskList'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'TaskDrawer',
  components: {
    TaskList,
  },
  mixins: [WindowsMixin],
  props: {
    id: {
      type: String,
    },
    resId: {
      type: String,
    },
    getParams: [Object, Function],
  },
}
</script>
