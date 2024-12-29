<template>
  <div>
    <page-header :title="title" :tabs="taskStageOptions" :current-tab.sync="taskStage" />
    <page-body>
      <list :id="listId" :resource="resource" :taskStage="taskStage" />
    </page-body>
  </div>
</template>

<script>
import List from './components/List'

export default {
  name: 'TaskPage',
  components: {
    List,
  },
  props: {
    resource: {
      type: String,
    },
    title: {
      type: String,
    },
  },
  data () {
    return {
      taskStageOptions: [
        { key: 'in_progress', label: this.$t('common.task.stage.label.in_progress') },
        { key: 'complete', label: this.$t('common.task.stage.label.complete') },
      ],
      taskStage: 'in_progress',
    }
  },
  computed: {
    listId () {
      return this.taskStage === 'in_progress' ? 'TaskInProgressList' : 'TaskComplateList'
    },
  },
  methods: {},
}
</script>
