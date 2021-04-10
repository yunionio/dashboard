<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('helm.text_95')"
    icon="res-k8s-repo"
    :res-name="detailData.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :res-id="data.id" :data="detailData" :onManager="onManager" resource="persistentvolumeclaims" />
  </base-side-page>
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import Detail from './Detail'
import SourceInformationSidepage from '@K8S/sections/SourceInformationSidepage'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'K8SRepoSidePage',
  components: {
    Actions,
    Detail,
    SourceInformationSidepage,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('helm.text_78'), key: 'detail' },
      ],
    }
  },
}
</script>
