<template>
  <base-side-page
    @cancel="cancelSidePage"
    title="RDS"
    icon="res-rds"
    :res-name="detailData.name"
    :tabs="detailTabs"
    :current-tab="params.windowData.currentTab"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :data="detailData" :on-manager="onManager"  :params="getParams" :res-id="getParams.resId" :id="listId" />
  </base-side-page>
</template>

<script>
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import Detail from './Detail'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'

export default {
  name: 'RDSDatabaseSidePage',
  components: {
    Actions,
    Detail,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('db.text_187'), key: 'detail' },
        { label: this.$t('db.text_192'), key: 'event-drawer' },
      ],
    }
  },
  computed: {
    getParams () {
      return {
        resId: this.detailData.id,
        details: true,
      }
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'event-drawer':
          return 'EventListForRDSDatabaseSidePage'
        default:
          return ''
      }
    },
  },
}
</script>
