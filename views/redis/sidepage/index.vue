<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="Redis"
    icon="onecloud"
    :res-name="data.name"
    :actions="params.actions"
    :tabs="detailTabs"
    v-model="detailComponent">
    <!-- <template v-slot:actions>
      <actions :options="params.singleActions" :row="data" :buttonMode="false" />
    </template> -->
    <component :is="detailComponent" :data="data" :list="params.list" :params="getParams" />
  </base-side-page>
</template>

<script>
import RedisDetail from './Detail'
import RedisWhiteList from './WhiteList'
import RedisAccountList from './AccountList'
import RedisBackupList from './BackupList'
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
  },
  mixins: [SidePageMixin, WindowsMixin],
  data () {
    return {
      detailComponent: 'redis-detail',
      detailTabs: [
        { label: '详情', key: 'redis-detail' },
        { label: '白名单设置', key: 'redis-white-list' },
        { label: '账号管理', key: 'redis-account-list' },
        { label: '备份列表', key: 'redis-backup-list' },
      ],
    }
  },
  computed: {
    getParams () {
      return {
        elasticcache_id: this.params.resId,
        details: true,
      }
    },
    data () {
      return this.params.list.data[this.params.resId].data
    },
  },
}
</script>
