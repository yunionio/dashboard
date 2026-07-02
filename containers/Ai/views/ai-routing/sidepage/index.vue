<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('aice.aiproxy.routing')"
    icon="res-ai-routing"
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
      :res-id="data.id"
      :id="listId"
      :data="detailData"
      :on-manager="onManager"
      :columns="columns"
      :initial-virtual-key-id="chatTestVirtualKeyId"
      :initial-virtual-key="chatTestVirtualKey" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import Detail from './Detail'
import AiRoutingAccessPanel from './AiRoutingAccessPanel'
import ChatTest from './ChatTest'
import RoutingModelsList from './RoutingModelsList'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'AiRoutingSidePage',
  components: {
    Detail,
    'routing-access-panel': AiRoutingAccessPanel,
    'chat-test': ChatTest,
    RoutingModelsList,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      chatTestVirtualKeyId: '',
      chatTestVirtualKey: '',
      detailTabs: [
        { label: this.$t('common_386'), key: 'detail' },
        { label: this.$t('aice.aiproxy.routing_access'), key: 'routing-access-panel' },
        { label: this.$t('aice.llm_deployment.chat_test'), key: 'chat-test' },
        { label: this.$t('aice.aiproxy.routing_models'), key: 'routing-models-list' },
        { label: this.$t('aice.event'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForAiRoutingSidePage'
        case 'routing-models-list':
          return 'AiRoutingModelsListForSidePage'
        default:
          return ''
      }
    },
  },
  mounted () {
    this.$bus.$on('aiRoutingOpenChatTest', this.handleOpenChatTest)
  },
  beforeDestroy () {
    this.$bus.$off('aiRoutingOpenChatTest', this.handleOpenChatTest)
  },
  methods: {
    handleOpenChatTest ({ routingId, virtualKeyId, virtualKey }) {
      if (routingId !== this.data.id) return
      this.chatTestVirtualKeyId = virtualKeyId || ''
      this.chatTestVirtualKey = virtualKey || ''
      this.handleTabChange('chat-test')
    },
  },
}
</script>
