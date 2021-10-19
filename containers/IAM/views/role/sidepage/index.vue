<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('dictionary.role')"
    icon="res-role"
    :res-name="detailData.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions :options="singleActions" :row="detailData" button-type="link" button-size="small" />
    </template>
    <component
      :is="params.windowData.currentTab"
      :res-id="data.id"
      :id="listId"
      :data="detailData"
      :onManager="onManager"
      :getParams="getParams"
      :columns="columns"
      :single-refresh-role="singleRefresh"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import RoleDetail from './Detail'
import PoliciesListForRoleSidepage from './Policies'

export default {
  name: 'RoleSidePage',
  components: {
    RoleDetail,
    Actions,
    PoliciesListForRoleSidepage,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('system.text_159'), key: 'role-detail' },
        { label: this.$t('res.policy'), key: 'policies-list-for-role-sidepage' },
        { label: this.$t('system.text_17'), key: 'event-drawer' },
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
          return 'EventListForRoleSidePage'
        case 'policies-list-for-role-sidepage':
          return 'PoliciesListForRoleSidepage'
        default:
          return ''
      }
    },
    hiddenActions () {
      return this.params.hiddenActions || []
    },
  },
  created () {
    if (this.params.tab) this.handleTabChange(this.params.tab)
  },
}
</script>
