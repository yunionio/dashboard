<template>
  <base-side-page
   @cancel="cancelSidePage"
    title="存储桶"
    icon="res-bucket"
    :res-name="detailData.name"
    :tabs="detailTabs"
    :current-tab="params.windowData.currentTab"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component :columns="columns" :is="params.windowData.currentTab" :data="detailData" :on-manager="onManager" :refresh="refresh" :getParams="getParams" :params="getParams" :res-id="getParams.storage" />
  </base-side-page>
</template>

<script>

import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
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
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
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
        storage: this.data.id,
        details: true,
      }
    },
  },
}
</script>
