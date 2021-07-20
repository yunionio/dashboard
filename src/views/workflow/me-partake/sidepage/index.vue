<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('common_198')"
    icon="res-user"
    :res-name="detailData.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component :is="params.windowData.currentTab" :onManager="onManager" :res-id="data.id" :data="detailData" :getParams="getParams" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import MePartakeDetail from './Detail'

export default {
  name: 'MePartakeSidePage',
  components: {
    MePartakeDetail,
    Actions,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('common_386'), key: 'me-partake-detail' },
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
