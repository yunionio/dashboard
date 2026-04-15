<template>
  <task-list
    :resource="resource"
    :archivedResource="archivedResource"
    :root="root"
    :taskStage="taskStage"
    :listId="id"
    :objId="objId"
    :getParams="getParams"
    :ignoreResId="ignoreResId" />
</template>

<script>
import TaskList from '@/sections/TaskList'

export default {
  name: 'TaskPageList',
  components: {
    TaskList,
  },
  props: {
    resource: {
      type: String,
    },
    archivedResource: {
      type: String,
    },
    id: {
      type: String,
    },
    taskStage: {
      type: String,
    },
    objId: {
      type: String,
    },
    getParams: [Object, Function],
    root: {
      type: Boolean,
      default: true,
    },
    ignoreResId: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {}
  },
  methods: {},
}
</script>

<style lang="less" scoped></style>
