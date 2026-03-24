<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="isApplyType ? $t('aice.app_llm') : $t('aice.llm')"
    icon="res-vminstance"
    :res-name="detailData.name"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <template v-slot:actions>
      <actions
        :options="singleActions"
        :row="rowWithCmpInfo"
        button-type="link"
        button-size="small" />
    </template>
    <component
      :is="params.windowData.currentTab"
      :res-id="data.id"
      :monitorResId="detailData.cmp_id"
      :id="listId"
      :data="childPageData"
      :getParams="getParams"
      :on-manager="onManager"
      :columns="columns"
      taskResource="clouddesktop-tasks" />
  </base-side-page>
</template>

<script>
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'
import Actions from '@/components/PageList/Actions'
// import InstantAppIndex from '@K8S/views/llm-instantmodel/components/List.vue'
import Monitor from '@Compute/views/vminstance-container/sidepage/Monitor'
import Log from '@Compute/views/pod-container/sidepage/Log'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import Detail from './Detail'
import Model from './Model'

export default {
  name: 'LlmSidePage',
  components: {
    Detail,
    Log,
    // InstantAppIndex,
    Actions,
    Monitor,
    Model,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      cmpInfo: null,
    }
  },
  computed: {
    rowWithCmpInfo () {
      return { ...this.detailData, cmp_info: this.cmpInfo }
    },
    childPageData () {
      return { guest_id: this.detailData.cmp_id, ...this.rowWithCmpInfo }
    },
    isApplyType () {
      return this.$route.path.includes('app-llm')
    },
    detailTabs () {
      const ret = [
        { label: this.$t('aice.detail'), key: 'detail' },
        { label: this.$t('aice.model'), key: 'model' },
        // { label: this.$t('aice.instant_app'), key: 'instant-app-index' },
        { label: this.$t('compute.text_608'), key: 'monitor' },
        { label: this.$t('k8s.text_325'), key: 'log' },
        // { label: this.$t('table.title.task'), key: 'task-drawer' },
        { label: this.$t('aice.event'), key: 'event-drawer' },
      ]
      if (this.isApplyType) {
        return ret.filter(item => item.key !== 'model')
      }
      return ret
    },
    getParams () {
      if (this.params.windowData.currentTab === 'task-drawer') {
        return {
          is_root: true,
        }
      } else if (this.params.windowData.currentTab === 'backup-list') {
        return {
          desktop_id: this.data.id,
        }
      } else if (this.params.windowData.currentTab === 'phone-app-index') {
        return {
          desktop_id: this.data.id,
        }
      }
      return null
    },
    listId () {
      switch (this.params.windowData.currentTab) {
        case 'task-drawer':
          return 'TaskListForDesktopSidePage'
        case 'event-drawer':
          return 'EventListForDesktopSidePage'
        case 'backup-list':
          return 'BackupListForDesktopSidePage'
        case 'phone-app-index':
          return 'DesktopAppIndexForDesktopSidePage'
        default:
          return ''
      }
    },
  },
  watch: {
    // 列表侧同步刷新 this.data.data 时不会再走 fetchDataCallback，需监听 cmp_id
    'data.data.cmp_id': {
      handler (cmpId) {
        this.fetchCmpServerInfo(cmpId)
      },
    },
  },
  methods: {
    // SidePageMixin.fetchData 在详情 get 成功后会 await 此方法（此时已有 detailData）
    async fetchDataCallback () {
      await this.fetchCmpServerInfo(this.detailData.cmp_id)
    },
    async fetchCmpServerInfo (cmpId) {
      if (!cmpId) {
        this.cmpInfo = null
        return
      }
      try {
        const params = {
          scope: 'system',
          show_fail_reason: true,
          show_emulated: true,
          system: true,
        }
        const { data } = await new this.$Manager('servers').get({ id: cmpId, params })
        if (this._isDestroyed) return
        this.cmpInfo = data || null
      } catch (e) {
        this.cmpInfo = null
      }
    },
  },
}
</script>
