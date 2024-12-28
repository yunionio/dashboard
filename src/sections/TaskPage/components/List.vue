<template>
  <task-list
    :resource="resource"
    root="true"
    :taskStage="taskStage"
    :listId="listId" />
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
    listId: {
      type: String,
    },
    taskStage: {
      type: String,
    },
  },
  data () {
    return {}
  },
  methods: {},
}
</script>

<style lang="less" scoped></style>
