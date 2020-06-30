<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="RDS"
    icon="res-rds"
    :res-name="detailData.name"
    :tabs="detailTabs"
    :current-tab="params.windowData.currentTab"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :data="detailData" :on-manager="onManager" :params="getParams" :res-id="getParams.dbinstance" />
  </base-side-page>
</template>

<script>
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import Detail from './Detail'
import Monitor from './Monitor'
import BackupList from '@DB/views/rds-backup/components/List'
import AccountList from '@DB/views/rds-account/components/List'
import DatabaseList from '@DB/views/rds-database/components/List'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'RDSSidePage',
  components: {
    Actions,
    AccountList,
    Detail,
    DatabaseList,
    BackupList,
    Monitor,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'detail' },
        { label: '账号', key: 'account-list' },
        { label: '数据库管理', key: 'database-list' },
        { label: '备份管理', key: 'backup-list' },
        { label: '监控', key: 'monitor' },
        { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      return {
        dbinstance: this.detailData.id,
        details: true,
      }
    },
  },
}
</script>
