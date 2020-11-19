<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('network.text_139')"
    icon="res-lbbackendgroup"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component
      :is="params.windowData.currentTab"
      :res-id="detailData.id"
      :data="detailData"
      :lbData="params.options.lbData"
      :getParams="getParams"
      :on-manager="onManager"
      @side-page-trigger-handle="sidePageTriggerHandle"
      @init-side-page-tab="initSidePageTab"
      @refresh="refresh"
      @single-refresh="singleRefresh"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import LoadbalancerbackendgroupDetail from './Detail'
import LoadbalancerbackendList from '@Network/views/loadbalancerbackend/components/List'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'LoadbalancerbackendgroupSidePage',
  components: {
    LoadbalancerbackendgroupDetail,
    LoadbalancerbackendList,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('network.text_67'), key: 'loadbalancerbackendgroup-detail' },
        { label: this.$t('network.text_140'), key: 'loadbalancerbackend-list' },
        { label: this.$t('network.text_150'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      if (this.params.windowData.currentTab === 'loadbalancerbackend-list') {
        const params = {
          backend_group: this.detailData.id,
        }
        return params
      }
      return null
    },
  },
}
</script>
