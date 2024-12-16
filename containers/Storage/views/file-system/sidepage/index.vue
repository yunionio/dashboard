<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('dictionary.filesystem')"
    icon="res-file-system"
    :res-name="detailData.name"
    :actions="params.actions"
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
      :id="listId"
      :res-id="detailData.id"
      :data="detailData"
      :getParams="getParams"
      :on-manager="onManager"
      taskResource="compute-tasks"
      @side-page-trigger-handle="sidePageTriggerHandle"
      @init-side-page-tab="initSidePageTab"
      @refresh="refresh"
      @single-refresh="singleRefresh"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import MountTargetList from '@Storage/views/mount-target/components/List'
import Actions from '@/components/PageList/Actions'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import FileSystemDetail from './Detail'

export default {
  name: 'FileSystemSidePage',
  components: {
    FileSystemDetail,
    MountTargetList,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('storage.text_81'), key: 'file-system-detail' },
        { label: this.$t('dictionary.mount_target'), key: 'mount-target-list' },
        { label: this.$t('table.title.task'), key: 'task-drawer' },
        { label: this.$t('storage.text_85'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      if (this.params.windowData.currentTab === 'mount-target-list') {
        return {
          file_system_id: this.detailData.id,
        }
      }
      return null
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForNasSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
