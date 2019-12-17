<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="任务"
    icon="res-servicecatalog"
    :res-name="data.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="params.singleActions" :row="data" button-type="link" button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :res-id="params.resId" :data="data" :list="params.list" :getParams="getParams" />
  </base-side-page>
</template>

<script>
import Detail from './Detail'
import Logs from './Logs'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'AnsiblePlaybookSidepage',
  components: {
    Detail,
    Actions,
    Logs,
  },
  mixins: [SidePageMixin, WindowsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'detail' },
        { label: '输出日志', key: 'logs' },
        { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      return {
        host: this.params.resId,
      }
    },
    data () {
      return this.params.list.data[this.params.resId].data
    },
  },
}
</script>
