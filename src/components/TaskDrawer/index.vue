<template>
  <task-page
    :resource="taskResource"
    :archivedResource="archivedResource"
    :obj-id="resId"
    :list-id="id || 'TaskListForCustomResourceSidePage'"
    :getParams="getParams"
    isSidepage
    root />
</template>

<script>
import TaskPage from '@/sections/TaskPage'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'TaskDrawer',
  components: {
    TaskPage,
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
  computed: {
    archivedResource () {
      if (this.taskResource && this.taskResource.includes('-tasks')) {
        return this.taskResource.replace('-tasks', '-archivedtasks')
      }
      return ''
    },
  },
}
</script>
