<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('aice.llm')"
    icon="res-vminstance"
    :res-name="detailData.name"
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
      :monitorResId="detailData.cmp_id"
      :id="listId"
      :data="detailData"
      :getParams="getParams"
      :on-manager="onManager"
      :columns="columns"
      taskResource="clouddesktop-tasks" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
// import InstantAppIndex from '@K8S/views/llm-instantmodel/components/List.vue'
// import Monitor from '@Compute/views/vminstance-container/sidepage/Monitor'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import Detail from './Detail'
import Model from './Model'

export default {
  name: 'LlmSidePage',
  components: {
    Detail,
    // InstantAppIndex,
    Actions,
    // Monitor,
    Model,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('aice.detail'), key: 'detail' },
        { label: this.$t('aice.model'), key: 'model' },
        // { label: this.$t('aice.instant_app'), key: 'instant-app-index' },
        // { label: this.$t('compute.text_608'), key: 'monitor' },
        // { label: this.$t('table.title.task'), key: 'task-drawer' },
        { label: this.$t('aice.event'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      if (this.params.windowData.currentTab === 'task-drawer') {
        return {
          is_root: true,
        }
      } else if (this.params.windowData.currentTab === 'backup-list') {
        return {
          desktop_id: this.data.id,
        }
      } else if (this.params.windowData.currentTab === 'phone-app-index') {
        return {
          desktop_id: this.data.id,
        }
      }
      return null
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'task-drawer':
          return 'TaskListForDesktopSidePage'
        case 'event-drawer':
          return 'EventListForDesktopSidePage'
        case 'backup-list':
          return 'BackupListForDesktopSidePage'
        case 'phone-app-index':
          return 'DesktopAppIndexForDesktopSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
