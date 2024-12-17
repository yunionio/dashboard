<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="Redis"
    icon="res-redis"
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
      :show-create-action="false"
      :res-id="getParams.elasticcache_id"
      :id="listId"
      :columns="columns"
      taskResource="compute-tasks" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import SecgroupList from '@Compute/views/secgroup/components/List'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import RedisDetail from './Detail'
import RedisWhiteList from './WhiteList'
import RedisAccountList from './AccountList'
import RedisBackupList from './BackupList'
import Monitor from './Monitor'

export default {
  name: 'RedisSidePage',
  components: {
    Actions,
    RedisDetail,
    SecgroupList,
    RedisWhiteList,
    RedisAccountList,
    RedisBackupList,
    Monitor,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {}
  },
  computed: {
    detailTabs () {
      const ret = [
        { label: this.$t('db.text_187'), key: 'redis-detail' },
        { label: this.$t('db.text_330'), key: 'redis-white-list' },
        { label: this.$t('db.text_331'), key: 'redis-account-list' },
        { label: this.$t('db.text_332'), key: 'redis-backup-list' },
        { label: this.$t('db.text_191'), key: 'monitor' },
        { label: this.$t('table.title.task'), key: 'task-drawer' },
        { label: this.$t('db.text_192'), key: 'event-drawer' },
      ]
      return ret
    },
    showActions () {
      return !this.$isScopedPolicyMenuHidden('redis_hidden_columns.perform_action')
    },
    getParams () {
      return {
        elasticcache_id: this.detailData.id,
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
