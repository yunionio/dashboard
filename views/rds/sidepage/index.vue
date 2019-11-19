<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="Redis"
    icon="onecloud"
    :res-name="data.name"
    :actions="params.actions"
    :tabs="detailTabs"
    :current-tab="params.windowData.currentTab"
    @tab-change="handleTabChange">
    <!-- <template v-slot:actions>
      <actions :options="params.singleActions" :row="data" :buttonMode="false" />
    </template> -->
    <component :is="params.windowData.currentTab" :data="data" :list="params.list" :params="getParams" :res-id="getParams.elasticcache_id" />
  </base-side-page>
</template>

<script>
import RedisDetail from './Detail'
import AccountList from './AccountList'
import DatabaseList from './DatabaseList'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'RDSSidePage',
  components: {
    Actions,
    AccountList,
    RedisDetail,
    DatabaseList,
  },
  mixins: [SidePageMixin, WindowsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'redis-detail' },
        { label: '账号', key: 'account-list' },
        { label: '数据库管理', key: 'database-list' },
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
  created () {
    console.log(this.params)
  },
}
</script>
