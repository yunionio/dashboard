<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('aice.aiproxy.provider')"
    icon="res-ai-provider"
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
      :columns="columns" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import Detail from './Detail'
import ProviderModelsList from './ProviderModelsList'
import ProviderApiKeysList from './ProviderApiKeysList'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'AiProviderSidePage',
  components: { Detail, ProviderModelsList, ProviderApiKeysList, Actions },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('common_386'), key: 'detail' },
        { label: this.$t('aice.aiproxy.model'), key: 'provider-models-list' },
        { label: this.$t('aice.aiproxy.api_key'), key: 'provider-api-keys-list' },
        { label: this.$t('aice.event'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForAiProviderSidePage'
        case 'provider-models-list':
          return 'AiProviderModelsListForSidePage'
        case 'provider-api-keys-list':
          return 'AiProviderApiKeysListForSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
