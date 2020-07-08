<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="安全组"
    icon="res-secgroup"
    :res-name="detailData.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component
      :is="params.windowData.currentTab"
      :res-id="data.id"
      :data="detailData"
      :getParams="getParams"
      res-type="secgroup"
      :on-manager="onManager"
      @refresh="refresh"
      @single-refresh="singleRefresh"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import VminstanceList from './Server'
import SecgroupDetail from './Detail'
import InDirection from './InDirection'
import OutDirection from './OutDirection'
import CacheList from './Cache'
import VminstanceList from '@Compute/views/vminstance/components/List'
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
    VminstanceList,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'secgroup-detail' },
        { label: '入方向', key: 'in-direction' },
        { label: '出方向', key: 'out-direction' },
        { label: '关联虚拟机', key: 'vminstance-list' },
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
          id: this.data.id,
        }
      } else if (this.params.windowData.currentTab === 'out-direction') {
        return {
          type: 'out',
          id: this.data.id,
        }
      } else if (this.params.windowData.currentTab === 'cache-list') {
        return {
          id: this.data.id,
        }
      } else if (this.params.windowData.currentTab === 'vminstance-list') {
        return {
          secgroup: this.detailData.id,
        }
      }
      return null
    },
  },
  created () {
    if (this.params.tab) this.handleTabChange(this.params.tab)
  },
}
</script>
