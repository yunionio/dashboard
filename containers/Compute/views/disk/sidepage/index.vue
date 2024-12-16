<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('compute.text_100')"
    icon="res-disk"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions v-if="showActions">
      <actions
        :options="singleActions"
        :row="detailData"
        :before-show-menu="beforeShowMenu"
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
      :columns="columns"
      taskResource="compute-tasks" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import DiskDetail from './Detail'
import SnapshotList from './snapshot'

export default {
  name: 'DiskSidePage',
  components: {
    DiskDetail,
    SnapshotList,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('compute.text_238'), key: 'disk-detail' },
        { label: this.$t('compute.text_462'), key: 'snapshot-list' },
        { label: this.$t('table.title.task'), key: 'task-drawer' },
        { label: this.$t('compute.text_240'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      return null
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForDiskSidePage'
        default:
          return ''
      }
    },
    showActions () {
      return !this.$isScopedPolicyMenuHidden('disk_hidden_columns.perform_action')
    },
    hiddenColumns () {
      return this.params.hiddenColumns || []
    },
  },
  methods: {
    beforeShowMenu () {
      return this.$store.dispatch('scopedPolicy/get', {
        category: ['disk_hidden_menus'],
      })
    },
  },
}
</script>
