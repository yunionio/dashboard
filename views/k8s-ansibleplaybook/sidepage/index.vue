<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('helm.text_66')"
    icon="res-k8s-job"
    :res-name="detailData.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <component :is="params.windowData.currentTab" :output="params.options.output" :onManager="onManager" />
  </base-side-page>
</template>

<script>
import Logs from './Logs'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'K8sAnsibleplaybookSidePage',
  components: {
    Actions,
    Logs,
  },
  mixins: [SidePageMixin, WindowsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('helm.text_67'), key: 'logs' },
      ],
    }
  },
}
</script>
