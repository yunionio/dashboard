<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="RDS备份"
    icon="res-rds-backup"
    :res-name="data.name"
    :actions="params.actions"
    :tabs="detailTabs"
    :current-tab="params.windowData.currentTab">
    <component :is="params.windowData.currentTab" :data="data" :list="params.list" />
  </base-side-page>
</template>

<script>
import RdsBackupDetail from './Detail'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'RDSBackupSidePage',
  components: {
    RdsBackupDetail,
  },
  mixins: [SidePageMixin, WindowsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'rds-backup-detail' },
      ],
    }
  },
  computed: {
    data () {
      return this.params.list.data[this.params.resId].data
    },
  },
}
</script>
