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
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :data="detailData" :on-manager="onManager" :params="getParams" :res-id="getParams.elasticcache_id" />
  </base-side-page>
</template>

<script>
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import RedisDetail from './Detail'
import RedisWhiteList from './WhiteList'
import RedisAccountList from './AccountList'
import RedisBackupList from './BackupList'
import Monitor from './Monitor'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'RedisSidePage',
  components: {
    Actions,
    RedisDetail,
    RedisWhiteList,
    RedisAccountList,
    RedisBackupList,
    Monitor,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'redis-detail' },
        { label: '白名单设置', key: 'redis-white-list' },
        { label: '账号管理', key: 'redis-account-list' },
        { label: '备份列表', key: 'redis-backup-list' },
        { label: '监控', key: 'monitor' },
        { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      return {
        elasticcache_id: this.detailData.id,
        details: true,
      }
    },
  },
}
</script>
