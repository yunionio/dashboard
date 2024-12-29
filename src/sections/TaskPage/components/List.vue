<template>
  <task-list
    :resource="resource"
    root="true"
    :taskStage="taskStage"
    :listId="id" />
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
    id: {
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
