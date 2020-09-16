<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('k8s.text_316')"
    icon="res-k8s-pod"
    :res-name="detailData.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :res-id="data.id" :data="detailData" :onManager="onManager" resource="pods" :field="field" :getParams="getParams" />
  </base-side-page>
</template>

<script>
/* eslint-disable import/no-duplicates */
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import Detail from './Detail'
import Terminal from './Terminal'
import Log from './Log'
import EventsSidepage from '@K8S/sections/EventsSidepage'
import ContainerSidepage from '@K8S/sections/ContainerSidepage'
import InitContainerSidepage from '@K8S/sections/ContainerSidepage'
import ConditionSidepage from '@K8S/sections/ConditionSidepage'
import SourceInformationSidepage from '@K8S/sections/SourceInformationSidepage'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'K8SPodSidePage',
  components: {
    Actions,
    Detail,
    Terminal,
    Log,
    EventsSidepage,
    SourceInformationSidepage,
    ContainerSidepage,
    InitContainerSidepage,
    ConditionSidepage,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('k8s.text_217'), key: 'detail' },
        { label: this.$t('k8s.text_324'), key: 'terminal' },
        { label: this.$t('k8s.text_325'), key: 'log' },
        { label: this.$t('k8s.text_1'), key: 'container-sidepage' },
        { label: this.$t('k8s.text_326'), key: 'init-container-sidepage' },
        { label: this.$t('k8s.text_327'), key: 'condition-sidepage' },
        { label: this.$t('k8s.text_218'), key: 'events-sidepage' },
        { label: this.$t('k8s.text_219'), key: 'source-information-sidepage' },
        { label: this.$t('compute.text_240'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    field () {
      if (this.params.windowData.currentTab === 'container-sidepage') return 'containers'
      if (this.params.windowData.currentTab === 'init-container-sidepage') return 'initContainers'
      return ''
    },
    getParams () {
      return {
        owner_kind: this.detailData.kind,
        owner_name: this.detailData.name,
        namespace: this.detailData.namespace,
        cluster: this.detailData.clusterID,
      }
    },
  },
}
</script>
