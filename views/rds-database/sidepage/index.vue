<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="RDS"
    icon="res-rds"
    :res-name="data.name"
    :actions="params.actions"
    :tabs="detailTabs"
    :current-tab="params.windowData.currentTab"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="params.singleActions" :row="data" button-type="link" button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :data="data" :list="params.list" :params="getParams" :res-id="getParams.resId" />
  </base-side-page>
</template>

<script>
import Detail from './Detail'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'RDSDatabaseSidePage',
  components: {
    Actions,
    Detail,
  },
  mixins: [SidePageMixin, WindowsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'detail' },
        { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      return {
        resId: this.params.resId,
        details: true,
      }
    },
    data () {
      return this.params.list.data[this.params.resId].data
    },
  },
}
</script>
