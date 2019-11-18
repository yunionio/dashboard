<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="主机组"
    icon="onecloud"
    :res-name="data.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="params.singleActions" :row="data" :buttonMode="false" />
    </template>
    <component
      :is="params.windowData.currentTab"
      :data="data"
      :list="params.list"
      :res-id="params.resId"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import InstanceGroupDetail from './Detail'
import VMInstanceListForInstanceGroup from './VMInstanceListForInstanceGroup'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'InstanceGroupSidePage',
  components: {
    Actions,
    InstanceGroupDetail,
    VMInstanceListForInstanceGroup,
  },
  mixins: [SidePageMixin, WindowsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'instance-group-detail' },
        { label: '已绑定主机', key: 'v-m-instance-list-for-instance-group' },
        { label: '操作日志', key: 'event-drawer' },
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
