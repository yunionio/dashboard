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
      :res-id="getParams.dbinstance"
      :id="listId"
      :columns="columns"
      taskResource="compute-tasks" />
  </base-side-page>
</template>

<script>
import BackupList from '@DB/views/rds-backup/components/List'
import AccountList from '@DB/views/rds-account/components/List'
import DatabaseList from '@DB/views/rds-database/components/List'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import SecgroupList from '@Compute/views/secgroup/components/List'
import Monitor from './Monitor'
import Detail from './Detail'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'

export default {
  name: 'RDSSidePage',
  components: {
    Actions,
    AccountList,
    Detail,
    SecgroupList,
    DatabaseList,
    BackupList,
    Monitor,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('db.text_187'), key: 'detail' },
        { label: this.$t('db.text_188'), key: 'account-list' },
        { label: this.$t('db.text_189'), key: 'database-list' },
        { label: this.$t('db.text_190'), key: 'backup-list' },
        { label: this.$t('db.text_191'), key: 'monitor' },
        { label: this.$t('table.title.task'), key: 'task-drawer' },
        { label: this.$t('db.text_192'), key: 'event-drawer' },
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
    showActions () {
      return !this.$isScopedPolicyMenuHidden('rds_hidden_columns.perform_action')
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForRDSSidePage'
        case 'account-list':
          return 'AccountListForRDSSidePage'
        case 'database-list':
          return 'DatabaseListForRDSSidePage'
        case 'backup-list':
          return 'BackupListForRDSSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
