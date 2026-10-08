<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('k8s.vc_hypernode')"
    icon="res-k8s-kubecluster"
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
      :key="params.windowData.currentTab"
      :id="listId"
      :res-id="data.id"
      :data="detailData"
      :onManager="onManager"
      resource="vchypernodes"
      :getParams="getParams"
      :showSearchbox="false"
      :showGroupActions="false" />
  </base-side-page>
</template>

<script>
import NodeList from '@K8S/views/nodes/components/List'
import VchypernodeList from '@K8S/views/vchypernode/components/List'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import Detail from './Detail'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'

function nameInFilter (names) {
  const list = (names || []).filter(Boolean)
  if (!list.length) return 'name.in("__none__")'
  return `name.in(${list.map(name => `"${name}"`).join(',')})`
}

export default {
  name: 'K8SVCHyperNodeSidePage',
  components: {
    Actions,
    Detail,
    NodeList,
    VchypernodeList,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('k8s.text_217'), key: 'detail' },
        { label: this.$t('k8s.text_21'), key: 'node-list' },
        { label: this.$t('k8s.vc_hypernode'), key: 'vchypernode-list' },
        { label: this.$t('compute.text_240'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      const tab = this.params.windowData.currentTab
      if (tab === 'event-drawer') {
        return {}
      }
      const cluster = this.detailData.clusterID
      if (tab === 'node-list') {
        return {
          cluster,
          'filter.0': nameInFilter(this.detailData.nodes),
        }
      }
      if (tab === 'vchypernode-list') {
        return {
          cluster,
          'filter.0': nameInFilter(this.detailData.hyperNodes),
        }
      }
      return { cluster }
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'node-list':
          return 'NodeListForK8SVCHyperNodeSidePage'
        case 'vchypernode-list':
          return 'HyperNodeListForK8SVCHyperNodeSidePage'
        case 'event-drawer':
          return 'EventListForK8SVCHyperNodeSidePage'
        default:
          return ''
      }
    },
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'K8SVCHyperNodeSidePage', {
        id: row.id,
        resource: 'vchypernodes',
        apiVersion: 'v1',
        getParams: () => ({
          cluster: row.clusterID,
        }),
      })
    },
  },
}
</script>
