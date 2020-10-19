<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('compute.text_95')"
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
      :id="listId"
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
        { label: this.$t('compute.text_238'), key: 'detail' },
        { label: this.$t('compute.text_949'), key: 'rule-list' },
        { label: this.$t('compute.text_974'), key: 'activitie-list' },
        { label: this.$t('compute.text_975'), key: 'server-list' },
        { label: this.$t('compute.text_873'), key: 'server-template-list' },
        { label: this.$t('compute.text_240'), key: 'event-drawer' },
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
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForScalingGroupSidePage'
        case 'server-template-list':
          return 'ServerTemplateForScalingGroupSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
