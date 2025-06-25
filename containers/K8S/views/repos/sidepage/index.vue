<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('k8s.text_158')"
    icon="res-k8s-repos"
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
      :res-id="data.id"
      :id="listId"
      :data="detailData"
      :getParams="getParams"
      :on-manager="onManager"
      :columns="columns" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import Detail from './Detail'
import ContainerRegistry from './ContainerRegistry'

export default {
  name: 'K8sReposSidePage',
  components: {
    Detail,
    ContainerRegistry,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('compute.text_238'), key: 'detail' },
        { label: this.$t('k8s.text_42'), key: 'container-registry' },
        { label: this.$t('compute.text_240'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      return {}
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForNotifySidePage'
        default:
          return ''
      }
    },
  },
}
</script>
