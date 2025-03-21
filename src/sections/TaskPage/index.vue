<template>
  <div>
    <page-header :title="title" :tabs="taskStageOptions" :current-tab.sync="taskStage" />
    <page-body>
      <list :id="listId" :resource="resource" :archivedResource="archivedResource" :taskStage="taskStage" />
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
    archivedResource: {
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
        { key: 'archived', label: this.$t('common.task.stage.label.archived') },
      ],
      taskStage: 'in_progress',
    }
  },
  computed: {
    listId () {
      if (this.taskStage === 'archived') return 'TaskArchivedList'
      return this.taskStage === 'in_progress' ? 'TaskInProgressList' : 'TaskComplateList'
    },
  },
  methods: {},
}
</script>
