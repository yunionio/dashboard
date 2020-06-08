<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="弹性伸缩组"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    icon="res-scalinggroup"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component
      :is="params.windowData.currentTab"
      :res-id="detailData.id"
      :data="detailData"
      :on-manager="onManager"
      :getParams="getParams"
      @tab-change="handleTabChange"
      :show-group-actions="showActions"
      :show-single-actions="showActions" />
  </base-side-page>
</template>

<script>
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import RuleList from './RuleList'
import activitieList from './ActivitieList'
import Detail from './Detail'
import ServerList from './ServerList'
import ServerTemplateList from '@Compute/views/servertemplate/components/List'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'ScalingGroupSidePage',
  components: {
    Detail,
    Actions,
    RuleList,
    activitieList,
    ServerList,
    ServerTemplateList,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'detail' },
        { label: '伸缩策略', key: 'rule-list' },
        { label: '活动历史', key: 'activitie-list' },
        { label: '当前实例', key: 'server-list' },
        { label: '主机模版', key: 'server-template-list' },
        { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
  computed: {
    showActions () {
      return this.params.windowData.currentTab !== 'server-template-list'
    },
    getParams () {
      if (this.params.windowData.currentTab === 'server-template-list') {
        return {
          id: this.detailData.guest_template_id,
        }
      } else {
        return {
          scaling_group: this.detailData.id,
        }
      }
    },
  },
}
</script>
