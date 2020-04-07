<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="容器组(Pod)"
    icon="res-group"
    :res-name="detailData.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :res-id="data.id" :data="detailData" :onManager="onManager" resource="pods" />
  </base-side-page>
</template>

<script>
import EventsSidepage from '@K8S/sections/EventsSidepage'
import ContainerSidepage from '@K8S/sections/ContainerSidepage'
import ConditionSidepage from '@K8S/sections/ConditionSidepage'
import SourceInformationSidepage from '@K8S/sections/SourceInformationSidepage'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import Detail from './Detail'
import Terminal from './Terminal'
import Log from './Log'
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
    ConditionSidepage,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: '详情', key: 'detail' },
        { label: '终端', key: 'terminal' },
        { label: '日志', key: 'log' },
        { label: '容器', key: 'container-sidepage' },
        { label: '现状', key: 'condition-sidepage' },
        { label: '事件', key: 'events-sidepage' },
        { label: '源信息', key: 'source-information-sidepage' },
      ],
    }
  },
}
</script>
