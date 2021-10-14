<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('dictionary.policy')"
    icon="res-policy"
    :res-name="detailData.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :res-id="data.id" :data="detailData" :onManager="onManager" :getParams="getParams" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import PolicyDetail from './Detail'

export default {
  name: 'PolicySidePage',
  components: {
    PolicyDetail,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('system.text_159'), key: 'policy-detail' },
        { label: this.$t('system.text_17'), key: 'event-drawer' },
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
