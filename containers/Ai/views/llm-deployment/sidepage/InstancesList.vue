<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :show-searchbox="false"
    :show-tag-filter="false" />
</template>

<script>
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import ColumnsMixin from '@Ai/views/llm/mixins/columns'
import SingleActionsMixin from '@Ai/views/llm/mixins/singleActions'
import InstanceGroupActionsMixin from '@Ai/views/llm/mixins/instanceGroupActions'

export default {
  name: 'LlmDeploymentInstancesList',
  mixins: [
    WindowsMixin,
    ListMixin,
    ColumnsMixin,
    SingleActionsMixin,
    InstanceGroupActionsMixin,
  ],
  inheritAttrs: false,
  props: {
    id: String,
    resId: String,
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id || 'LlmDeploymentInstancesList',
        resource: 'llms',
        getParams: this.getParam,
        steadyStatus: {
          status: Object.values(expectStatus.server).flat(),
          llm_status: Object.values(expectStatus.container).flat(),
        },
        fetchDataCb: (response) => {
          this.enrichLlmRowsWithCmpInfo(response)
        },
      }),
    }
  },
  computed: {
    groupActions () {
      return this.instanceGroupActions
    },
  },
  created () {
    this.serverManager = new this.$Manager('servers')
    this.columns = [
      ...this.columns.slice(0, 2),
      {
        field: 'dist_role',
        title: this.$t('aice.llm_deployment.dist_role'),
        minWidth: 120,
        formatter: ({ row }) => {
          if (!row.dist_role) return this.$t('aice.llm_deployment.dist_role.single')
          if (row.dist_role === 'leader') {
            return this.$t('aice.llm_deployment.dist_role.leader', [row.dist_rank ?? 0, row.dist_nnodes || 1])
          }
          if (row.dist_role === 'follower') {
            return this.$t('aice.llm_deployment.dist_role.follower', [row.dist_rank ?? 0, row.dist_nnodes || 1])
          }
          return row.dist_role
        },
      },
      ...this.columns.slice(2),
    ]
    this.list.fetchData()
  },
  methods: {
    getParam () {
      return {
        llm_deployment: this.data.id,
        details: true,
      }
    },
    async enrichLlmRowsWithCmpInfo (response) {
      const rows = response?.data?.data
      if (!Array.isArray(rows) || !rows.length) return
      const params = {
        scope: this.$store.getters.scope,
      }
      const patch = {}
      await Promise.all(
        rows.map(async (row) => {
          if (!row.cmp_id) return
          try {
            const { data } = await this.serverManager.get({ id: row.cmp_id, params })
            if (data) {
              patch[row.id] = { cmp_info: data }
            }
          } catch (e) {
            // 单行失败不影响列表
          }
        }),
      )
      if (this._isDestroyed) return
      if (Object.keys(patch).length) {
        this.list.updatesProperty(patch)
      }
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'LlmSidePage', {
        id: row.id,
        resource: 'llms',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
