<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('dictionary.waf_instance')"
    icon="waf"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :loaded="loaded"
    :tabs="detailTabs"
    @tab-change="handleTabChange">
    <component :is="params.windowData.currentTab" :res-id="data.id" :id="listId" :data="detailData" :on-manager="onManager" taskResource="compute-tasks" @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'WafRuleSidePage',
  components: {
  },
  mixins: [SidePageMixin, WindowsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('cloudenv.text_15'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForWafInstancesSidePage'
        default:
          return ''
      }
    },
  },
  created () {
  },
  methods: {
  },
}
</script>
