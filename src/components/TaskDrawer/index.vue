<template>
  <task-list
    :resource="taskResource"
    :obj-id="resId"
    :list-id="id || 'TaskListForCustomResourceSidePage'"
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
    taskResource: {
      type: String,
      default: 'cloud-phone-tasks',
    },
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
