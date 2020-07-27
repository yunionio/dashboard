<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('k8s.text_19')"
    icon="res-k8s-kubecluster"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
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
      :getParams="getParams"
      :on-manager="onManager"
      @refresh="refresh"
      @single-refresh="singleRefresh"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import KubeMachineList from '@K8S/views/kube-machines/components/List'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'K8SClusterSidePage',
  components: {
    Actions,
    KubeMachineList,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('k8s.text_21'), key: 'kube-machine-list' },
        { label: this.$t('k8s.text_202'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      return null
    },
  },
}
</script>
