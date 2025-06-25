<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('dictionary.identity_provider')"
    icon="res-idp"
    :res-name="detailData.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component v-if="data.id" :is="params.windowData.currentTab" :id="listId" :res-id="data.id" :resource="resource" :data="detailData" :onManager="onManager" :getParams="getParams" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import JumpTo from '@/mixins/jumper'
import Actions from '@/components/PageList/Actions'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import IDPDetail from './Detail'

export default {
  name: 'IDPSidePage',
  components: {
    'idp-detail': IDPDetail,
    Actions,
  },
  mixins: [WindowsMixin, SidePageMixin, ColumnsMixin, JumpTo, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('system.text_159'), key: 'idp-detail' },
        { label: this.$t('system.text_17'), key: 'event-drawer' },
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
          return 'EventListForIDPSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
