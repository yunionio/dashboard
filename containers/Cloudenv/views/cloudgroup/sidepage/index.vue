<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('dictionary.cloudgroup')"
    icon="res-cloudgroup"
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
      :data="detailData"
      :on-manager="onManager"
      :res-id="data.id"
      :id="listId"
      :getParams="getParams"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import CloudgroupDetail from './Detail'
import ClouduserListForCloudgroupSidepage from './ClouduserList'
import CloudpolicyListForCloudgroupSidepage from './CloudpolicyList'

export default {
  name: 'CloudgroupSidePage',
  components: {
    Actions,
    CloudgroupDetail,
    ClouduserListForCloudgroupSidepage,
    CloudpolicyListForCloudgroupSidepage,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('sidepage.tab.label.detail'), key: 'cloudgroup-detail' },
        { label: this.$t('dictionary.clouduser'), key: 'clouduser-list-for-cloudgroup-sidepage' },
        { label: this.$t('dictionary.policy'), key: 'cloudpolicy-list-for-cloudgroup-sidepage' },
        { label: this.$t('dictionary.actions'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      if (
        this.params.windowData.currentTab === 'clouduser-list-for-cloudgroup-sidepage' ||
        this.params.windowData.currentTab === 'cloudpolicy-list-for-cloudgroup-sidepage'
      ) {
        return {
          cloudgroup_id: this.data.id,
        }
      }
      return null
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForCloudgroupSidePage'
        case 'clouduser-list-for-cloudgroup-sidepage':
          return 'ClouduserListForCloudgroupSidePage'
        case 'cloudpolicy-list-for-cloudgroup-sidepage':
          return 'CloudpolicyListForCloudgroupSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
