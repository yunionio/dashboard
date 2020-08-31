<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('k8s.text_331')"
    icon="res-k8s-rbacclusterrolebinding"
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
      :data="detailData"
      resource="rbacclusterrolebindings"
      :serverColumns="columns"
      :res-id="data.name"
      :getParams="getParams"
      :on-manager="onManager"
      @refresh="refresh"
      @single-refresh="singleRefresh"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import K8sRbacclusterrolebindingDetail from './Detail'
import SourceInformationSidepage from '@K8S/sections/SourceInformationSidepage'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'K8SRbacclusterrolebindingSidePage',
  components: {
    Actions,
    K8sRbacclusterrolebindingDetail,
    SourceInformationSidepage,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('k8s.text_217'), key: 'k8s-rbac-role-bind-detail' },
        { label: this.$t('k8s.text_219'), key: 'source-information-sidepage' },
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
