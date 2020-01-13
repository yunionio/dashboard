<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="存储"
    icon="res-bucket"
    :res-name="data.name"
    :actions="params.actions"
    :tabs="detailTabs"
    :current-tab="params.windowData.currentTab"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="params.singleActions" :row="data" button-type="link" button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :data="data" :list="params.list" :getParams="getParams" :params="getParams" :res-id="getParams.storage" />
  </base-side-page>
</template>

<script>
import Detail from './Detail'
import Objects from './Objects'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'BucketStorageSidePage',
  components: {
    Actions,
    Detail,
    Objects,
  },
  mixins: [SidePageMixin, WindowsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'detail' },
        { label: '文件列表', key: 'objects' },
        { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      return {
        storage: this.params.resId,
        details: true,
      }
    },
    data () {
      return this.params.list.data[this.params.resId].data
    },
  },
}
</script>
