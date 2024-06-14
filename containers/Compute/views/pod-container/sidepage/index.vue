<template>
  <base-side-page
    :title="$t('compute.container', [])"
    icon="res-vminstance"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :tabs="filterDetailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange"
    @cancel="cancelSidePage">
    <template v-slot:actions>
      <actions
        :options="singleActions"
        :row="detailData"
        button-type="link"
        button-size="small" />
    </template>
    <component
      :is="params.windowData.currentTab"
      :data="detailData"
      :serverColumns="columns"
      :res-id="data.id"
      :id="listId"
      :on-manager="onManager"
      :isPageDestroyed="isPageDestroyed"
      @refresh="refresh"
      @single-refresh="singleRefresh"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import Log from './Log'
import Monitor from './Monitor'
import Detail from './Detail'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'VmPodContainerSidePage',
  components: {
    Actions,
    Log,
    Monitor,
    Detail,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    const detailTabs = [
      { label: this.$t('compute.text_238'), key: 'detail' },
      { label: this.$t('k8s.text_325'), key: 'log' },
      { label: this.$t('compute.text_608'), key: 'monitor' },
      { label: this.$t('compute.text_240'), key: 'event-drawer' },
    ]
    return {
      detailTabs,
      agent_status: '',
      agent_fail_reason: '',
      agent_fail_code: '',
      isPageDestroyed: false,
    }
  },
  computed: {
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'monitor':
          return 'MonitorListForVmPodContainerSidepage'
        default:
          return ''
      }
    },
    filterDetailTabs () {
      return this.detailTabs.map(item => {
        if (!this.detailData.id) {
          return {
            ...item,
            disabled: true,
          }
        }
        return item
      })
    },
  },
  created () { },
  beforeDestroy () {
    this.isPageDestroyed = true
  },
  methods: {},
}
</script>
