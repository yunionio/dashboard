<template>
  <base-side-page
   @cancel="cancelSidePage"
    :title="$t('dictionary.tablestore')"
    icon="res-table-storage"
    :res-name="detailData.name"
    :tabs="detailTabs"
    :current-tab="params.windowData.currentTab"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component :columns="columns" :is="params.windowData.currentTab" :data="detailData" :on-manager="onManager" :refresh="refresh" :getParams="getParams" :params="getParams" :res-id="getParams.storage" :id="listId" />
  </base-side-page>
</template>

<script>

// import SingleActionsMixin from '../mixins/singleActions'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import ColumnsMixin from '../mixins/columns'
import TablestoreDetail from './Detail'

export default {
  name: 'TablestoreSidePage',
  components: {
    Actions,
    TablestoreDetail,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('storage.text_81'), key: 'tablestore-detail' },
        { label: this.$t('storage.text_85'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      return {
        storage: this.data.id,
        details: true,
      }
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForBucketStorageSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
