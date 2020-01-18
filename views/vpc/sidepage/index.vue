<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="VPC"
    icon="res-vpc"
    :res-name="data.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    @tab-change="handleTabChange">
    <component :is="params.windowData.currentTab" :res-id="params.resId" :data="data" :list="params.list" :getParams="getParams" />
  </base-side-page>
</template>

<script>
import NetworkList from '../../network/components/List'
import VpcDetail from './Detail'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'VpcSidePage',
  components: {
    VpcDetail,
    NetworkList,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'vpc-detail' },
        { label: 'IP子网', key: 'network-list' },
        { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      if (this.params.windowData.currentTab === 'network-list') {
        return {
          width_meta: true,
          vpc: this.params.resId,
          details: true,
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
