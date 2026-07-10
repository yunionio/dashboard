<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('aice.llm_deployment')"
    icon="res-llm-deployment"
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
      :res-id="data.id"
      :id="listId"
      :data="detailData"
      :getParams="getParams"
      :on-manager="onManager"
      :columns="columns"
      :initial-virtual-key-id="chatTestVirtualKeyId"
      :initial-virtual-key="chatTestVirtualKey"
      :initial-chat-model="chatTestClientModel" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import Detail from './Detail'
import InstancesList from './InstancesList'
import AiproxyAccessPanel from './AiproxyAccessPanel'
import ChatTest from './ChatTest'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'LlmDeploymentSidePage',
  components: {
    Detail,
    InstancesList,
    'instances-list': InstancesList,
    AiproxyAccessPanel,
    ChatTest,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      chatTestVirtualKeyId: '',
      chatTestVirtualKey: '',
      chatTestClientModel: '',
      detailTabs: [
        { label: this.$t('common_386'), key: 'detail' },
        { label: this.$t('aice.llm_deployment.aiproxy_access'), key: 'aiproxy-access-panel' },
        { label: this.$t('aice.llm_deployment.chat_test'), key: 'chat-test' },
        { label: this.$t('aice.llm_deployment.instances'), key: 'instances-list' },
        { label: this.$t('aice.event'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      return null
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForLlmDeploymentSidePage'
        case 'instances-list':
          return 'LlmDeploymentInstancesList'
        default:
          return ''
      }
    },
  },
  mounted () {
    this.$bus.$on('llmDeploymentOpenChatTest', this.handleOpenChatTest)
  },
  beforeDestroy () {
    this.$bus.$off('llmDeploymentOpenChatTest', this.handleOpenChatTest)
  },
  methods: {
    handleOpenChatTest ({ deploymentId, virtualKeyId, virtualKey, clientModel }) {
      if (deploymentId !== this.data.id) return
      this.chatTestVirtualKeyId = virtualKeyId || ''
      this.chatTestVirtualKey = virtualKey || ''
      this.chatTestClientModel = clientModel || ''
      this.handleTabChange('chat-test')
    },
  },
}
</script>
