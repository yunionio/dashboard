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
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component
      :is="params.windowData.currentTab"
      :data="detailData"
      :on-manager="onManager"
      :params="getParams"
      :getParams="getParams"
      :id="listId"
      :columns="columns" />
  </base-side-page>
</template>

<script>
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import MongodbDetail from './Detail'
import MongodbBackupList from './BackupList.vue'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

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
        { label: this.$t('db.text_192'), key: 'event-drawer' },
      ]
      return ret
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
