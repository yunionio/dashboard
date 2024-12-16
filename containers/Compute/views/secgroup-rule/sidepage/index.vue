<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('dictionary.secgrouprule')"
    icon="res-secgroup"
    :res-name="name"
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
      :data="detailData"
      :getParams="getParams"
      res-type="secgrouprule"
      taskResource="compute-tasks" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import SingleActionsMixin from '../mixins/singleActions'

export default {
  name: 'SecgroupRuleSidePage',
  components: { Actions },
  mixins: [SidePageMixin, WindowsMixin, SingleActionsMixin],
  data () {
    const detailTabs = [
      { label: this.$t('table.title.task'), key: 'task-drawer' },
      { label: this.$t('compute.text_240'), key: 'event-drawer' },
    ]
    return {
      detailTabs,
      t: null,
    }
  },
  computed: {
    getParams () {
      return {
        t: this.t,
      }
    },
    name () {
      return this.detailData.cidr ? `${this.detailData.cidr} (IP)` : '-'
    },
  },
  created () {
    if (this.params.tab) this.handleTabChange(this.params.tab)
  },
  methods: {
    refresh () {
      this.t = new Date().getTime()
      if (this.isList) return this.params.list.refresh(...arguments)
      return this.fetchData()
    },
  },
}
</script>
