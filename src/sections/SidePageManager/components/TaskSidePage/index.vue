<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('table.title.task')"
    icon="res-task"
    :res-name="detailData.task_name"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions
        :options="singleActions"
        :row="detailData"
        button-type="link"
        button-size="small" />
    </template>
    <component
      :is="params.windowData.currentTab"
      :res-id="data.id"
      :listId="listId"
      :data="detailData"
      :getParams="getParams"
      :on-manager="onManager"
      :columns="columns"
      :taskStage="params.options.taskStage"
      :archivedResource="params.options.archivedResource"
      :resource="params.options.resource || 'compute-tasks'"
      :isRoot="false" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import ChildrenTaskList from '@/sections/TaskList'
import Detail from './Detail'

export default {
  name: 'TaskSidePage',
  components: {
    Detail,
    ChildrenTaskList,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin],
  data () {
    return {
    }
  },
  computed: {
    detailTabs () {
      const detailTabs = [
        { label: this.$t('sidepage.tab.label.detail'), key: 'detail' },
      ]
      if (this.data && this.data.data && this.data.data.sub_task_count > 0) {
        detailTabs.push({ label: this.$t('table.title.children_task'), key: 'children-task-list' })
      }
      return detailTabs
    },
    getParams () {
      if (this.params.windowData.currentTab === 'children-task-list') {
        return {
          is_root: false,
          parent_id: this.params.options.taskStage === 'archived' ? this.data.task_id : this.data.id,
        }
      } else {
        return {
          is_root: true,
        }
      }
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'children-task-list':
          return 'ChildrenTaskListForTaskSidePage'
        case 'event-drawer':
          return 'EventListForTaskSidePage'
        default:
          return ''
      }
    },
    getDetailExtraParams () {
      return this.params.options?.getParams
    },
  },
}
</script>
