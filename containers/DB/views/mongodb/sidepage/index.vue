<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('dictionary.mongodb')"
    icon="mongodb"
    :res-name="detailData.name"
    :tabs="detailTabs"
    :current-tab="params.windowData.currentTab"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions v-if="showActions">
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component
      :is="params.windowData.currentTab"
      :data="detailData"
      :on-manager="onManager"
      :params="getParams"
      :getParams="getParams"
      :res-id="data.id"
      :id="listId"
      :columns="columns"
      taskResource="compute-tasks" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import MongodbDetail from './Detail'
import MongodbBackupList from './BackupList.vue'

export default {
  name: 'MongoDBSidePage',
  components: {
    Actions,
    MongodbDetail,
    MongodbBackupList,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {}
  },
  computed: {
    detailTabs () {
      const ret = [
        { label: this.$t('db.text_187'), key: 'mongodb-detail' },
        { label: this.$t('db.text_332'), key: 'mongodb-backup-list' },
        { label: this.$t('table.title.task'), key: 'task-drawer' },
        { label: this.$t('db.text_192'), key: 'event-drawer' },
      ]
      return ret
    },
    showActions () {
      return !this.$isScopedPolicyMenuHidden('mongodb_hidden_columns.perform_action')
    },
    getParams () {
      return {
        details: true,
      }
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForRedisSidePage'
        case 'secgroup-list':
          return 'SecgroupListForRedisSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
