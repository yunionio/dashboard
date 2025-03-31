<template>
  <task-list
    :resource="resource"
    :archivedResource="archivedResource"
    :root="root"
    :taskStage="taskStage"
    :listId="id"
    :objId="objId"
    :getParams="getParams" />
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
  },
  data () {
    return {}
  },
  methods: {},
}
</script>

<style lang="less" scoped></style>
