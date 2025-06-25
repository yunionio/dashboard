<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('dictionary.waf_instance')"
    icon="res-waf"
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
    <component :is="params.windowData.currentTab" :res-id="data.id" :id="listId" :data="detailData" :on-manager="onManager" taskResource="compute-tasks" @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import Actions from '@/components/PageList/Actions'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import detail from './Detail'
import ResourceManage from './ResourceManage'
import RuleManage from './RuleManage'

export default {
  name: 'WafSidePage',
  components: {
    Actions,
    detail,
    ResourceManage,
    RuleManage,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('network.text_67'), key: 'detail' },
        { label: this.$t('network.waf.rule'), key: 'rule-manage' },
        { label: this.$t('network.waf.resource'), key: 'resource-manage' },
        { label: this.$t('table.title.task'), key: 'task-drawer' },
        { label: this.$t('cloudenv.text_15'), key: 'event-drawer' },
      ],
      domainList: this.params.domainList,
      projectList: this.params.projectList,
    }
  },
  computed: {
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForWafInstancesSidePage'
        case 'waf-rule-list':
          return 'WafRulesForWafInstancesSidePage'
        case 'waf-resource-list':
          return 'WafResourcesForWafInstancesSidePage'
        default:
          return ''
      }
    },
  },
  created () {
    // this.$bus.$on('dimensionDomainUpdated', (val) => {
    //   this.domainList = val
    // })
    // this.$bus.$on('dimensionProjectUpdated', (val) => {
    //   this.projectList = val
    // })
  },
  methods: {
    // openSidePageDimensionItemList () {
    //   this.initSidePageTab('dimension-item-list')
    // },
  },
}
</script>
