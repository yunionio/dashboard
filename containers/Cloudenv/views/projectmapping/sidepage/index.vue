<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('cloudenv.text_580')"
    icon="res-projectmapping"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :loaded="loaded"
    :tabs="detailTabs"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions
        :options="singleActions"
        :row="detailData"
        :before-show-menu="beforeShowMenu"
        button-type="link"
        button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :res-id="data.id" :id="listId" :data="detailData" :on-manager="onManager" :getParams="getParams" @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import RuleList from '@Cloudenv/views/projectmapping/components/RuleList/index.vue'
import Actions from '@/components/PageList/Actions'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import detail from './Detail'

export default {
  name: 'ProjectMappingSidePage',
  components: {
    Actions,
    detail,
    RuleList,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('cloudenv.text_237'), key: 'detail' },
        { label: this.$t('cloudenv.text_582'), key: 'rule-list' },
        { label: this.$t('cloudenv.text_15'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      return {
        proxy_setting: this.detailData.id,
      }
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForProjectMappingSidePage'
        case 'rule-list':
          return 'ProjectMappingRuleListForProjectMappingSidePage'
        default:
          return ''
      }
    },
  },
  methods: {
    openSidePageRuleList (row) {
      this.params.windowData.currentTab = 'rule-list'
    },
  },
}
</script>
