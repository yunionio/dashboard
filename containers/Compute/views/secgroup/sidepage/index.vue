<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="安全组"
    icon="res-secgroup"
    :res-name="data.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="params.singleActions" :row="data" button-type="link" button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :res-id="params.resId" :data="data" :list="params.list" :getParams="getParams" res-type="secgroup" />
  </base-side-page>
</template>

<script>
import SecgroupDetail from './Detail'
import InDirection from './InDirection'
import OutDirection from './OutDirection'
import CacheList from './Cache'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'SecGroupSidePage',
  components: {
    SecgroupDetail,
    Actions,
    OutDirection,
    InDirection,
    CacheList,
  },
  mixins: [SidePageMixin, WindowsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'secgroup-detail' },
        { label: '入方向', key: 'in-direction' },
        { label: '出方向', key: 'out-direction' },
        { label: '缓存列表', key: 'cache-list' },
        { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      if (this.params.windowData.currentTab === 'in-direction') {
        return {
          type: 'in',
          id: this.params.resId,
        }
      } else if (this.params.windowData.currentTab === 'out-direction') {
        return {
          type: 'out',
          id: this.params.resId,
        }
      } else if (this.params.windowData.currentTab === 'cache-list') {
        return {
          id: this.params.resId,
        }
      }
      return null
    },
    data () {
      return this.params.list.data[this.params.resId].data
    },
  },
}
</script>
