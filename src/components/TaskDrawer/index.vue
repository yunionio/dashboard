<template>
  <task-page
    :resource="taskResource"
    :archivedResource="archivedResource"
    :obj-id="resId"
    :list-id="id || 'TaskListForCustomResourceSidePage'"
    :getParams="rootedParams"
    isSidepage />
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
    rootedParams () {
      if (!this.getParams) {
        return {
          is_root: true,
        }
      }
      var params = {}
      if (typeof this.getParams === 'function') {
        params = this.getParams()
      } else {
        params = this.getParams
      }
      if (!params.is_root) {
        return {
          ...params,
          is_root: true,
        }
      }
      return params
    },
    archivedResource () {
      if (this.taskResource && this.taskResource.includes('-tasks')) {
        return this.taskResource.replace('-tasks', '-archivedtasks')
      }
      return ''
    },
  },
}
</script>
