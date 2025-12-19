<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('aice.llm_image')"
    icon="res-image"
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
      :columns="columns" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import Detail from './Detail'

export default {
  name: 'LlmImageSidePage',
  components: {
    Detail,
    Actions,
  },
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
    getParams () {
      return null
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForDesktopSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
