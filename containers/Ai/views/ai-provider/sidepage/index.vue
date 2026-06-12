<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('aice.aiproxy.provider')"
    icon="res-server"
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
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'AiProviderSidePage',
  components: { Detail, Actions },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('common_386'), key: 'detail' },
        { label: this.$t('aice.event'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    listId () {
      return this.params.windowData.currentTab === 'event-drawer' ? 'EventListForAiProviderSidePage' : ''
    },
  },
}
</script>
