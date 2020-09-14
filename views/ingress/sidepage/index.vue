<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('k8s.text_239')"
    icon="res-k8s-ingress"
    :res-name="detailData.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :res-id="data.id" :data="detailData" :onManager="onManager" resource="ingresses" />
  </base-side-page>
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import Detail from './Detail'
import ServiceList from '@K8S/views/service/components/List'
import SourceInformationSidepage from '@K8S/sections/SourceInformationSidepage'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'K8SIngressSidePage',
  components: {
    Actions,
    Detail,
    SourceInformationSidepage,
    ServiceList,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('k8s.text_217'), key: 'detail' },
        { label: this.$t('k8s.text_13'), key: 'service-list' },
        { label: this.$t('k8s.text_219'), key: 'source-information-sidepage' },
        { label: this.$t('compute.text_240'), key: 'event-drawer' },
      ],
    }
  },
}
</script>
