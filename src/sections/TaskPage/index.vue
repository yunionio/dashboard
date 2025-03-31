<template>
  <div>
    <template v-if="!isSidepage">
      <page-header :title="title" :tabs="taskStageOptions" :current-tab.sync="taskStage" />
      <page-body>
        <list :id="listId" :resource="resource" :archivedResource="archivedResource" :taskStage="taskStage" :objId="objId" :getParams="getParams" />
      </page-body>
    </template>
    <template v-else>
      <a-tabs :defaultActiveKey="taskStage" @change="callback" :animated="false">
        <template v-for="obj of taskStageOptions">
          <a-tab-pane :tab="obj.label" :key="obj.key" />
        </template>
      </a-tabs>
      <list :id="listId" :resource="resource" :archivedResource="archivedResource" :taskStage="taskStage" :objId="objId" :getParams="getParams" :root="false" />
    </template>
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
    objId: {
      type: String,
    },
    getParams: [Object, Function],
    isSidepage: {
      type: Boolean,
      default: false,
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
  methods: {
    callback (key) {
      this.taskStage = key
    },
  },
}
</script>
