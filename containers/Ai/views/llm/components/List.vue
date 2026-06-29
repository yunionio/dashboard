<template>
  <page-list
    :show-tag-filter="!embedded"
    :show-searchbox="!embedded"
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="embedded ? undefined : exportDataOptions" />
</template>

<script>
import { parseLlmRoute } from '@Ai/utils/llmRouteContext'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import {
  getNameFilter,
  getStatusFilter,
  getTenantFilter,
  getDomainFilter,
  getCreatedAtFilter,
  getCustomDistinctFieldFilter,
  getDistinctFieldFilter,
} from '@/utils/common/tableFilter'
import { LLM_TYPE_OPTIONS } from '../../llm-sku/constants/llmTypeConfig'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import InstanceGroupActionsMixin from '../mixins/instanceGroupActions'

export default {
  name: 'PhoneList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin, InstanceGroupActionsMixin],
  props: {
    id: String,
    embedded: {
      type: Boolean,
      default: false,
    },
    getParams: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'llms',
        getParams: this.getParam,
        steadyStatus: {
          status: Object.values(expectStatus.server).flat(),
          llm_status: Object.values(expectStatus.container).flat(),
        },
        filterOptions: {
          id: {
            label: this.$t('table.title.id'),
          },
          name: getNameFilter(),
          llm_type: {
            label: this.llmTypeFilterLabel,
            dropdown: true,
            items: this.llmTypeFilterOptions,
          },
          status: getStatusFilter('server'),
          llm_ip: {
            label: 'IP',
            filter: true,
            formatter: val => {
              return `llm_ip.contains(${val})`
            },
          },
          host: getCustomDistinctFieldFilter({
            label: this.$t('res.host'),
            field: 'host',
            fetchMethod: this.hostFetcher,
            disabledFormatter: true,
            multiple: false,
            mapper: (list) => {
              return list
            },
          }),
          // no_volume: {
          //   label: this.$t('aice.volume_mounted'),
          //   dropdown: true,
          //   items: [
          //     { label: this.$t('compute.text_394'), key: 'false' },
          //     { label: this.$t('compute.text_395'), key: 'true' },
          //   ],
          // },
          // llm_sku: {
          //   label: this.$t('aice.llm_sku'),
          // },
          llm_sku: getDistinctFieldFilter({
            field: 'llm_sku',
            type: 'extra_field',
            label: this.$t('aice.llm_sku'),
            multiple: false,
          }),
          llm_image: {
            label: this.$t('aice.image'),
          },
          projects: getTenantFilter(),
          project_domains: getDomainFilter(),
          created_at: getCreatedAtFilter(),
        },
        hiddenColumns: [],
        fetchDataCb: (response) => {
          this.enrichLlmRowsWithCmpInfo(response)
        },
      }),
    }
  },
  computed: {
    llmRouteCtx () {
      return parseLlmRoute(this.$route.path)
    },
    isApplyType () {
      return this.llmRouteCtx.isApplyType
    },
    isDesktopType () {
      return this.llmRouteCtx.isDesktopType
    },
    llmTypeFilterLabel () {
      if (this.isDesktopType) return this.$t('aice.llm_type.desktop')
      if (this.isApplyType) return this.$t('aice.llm_type.app')
      return this.$t('aice.llm_type.llm')
    },
    llmTypeFilterOptions () {
      let opts = LLM_TYPE_OPTIONS
      if (this.isDesktopType) {
        opts = opts.filter(opt => opt.id === 'desktop')
      } else if (this.isApplyType) {
        opts = opts.filter(opt => !['vllm', 'ollama', 'sglang', 'desktop'].includes(opt.id))
      } else {
        opts = opts.filter(opt => ['vllm', 'ollama', 'sglang'].includes(opt.id))
      }
      return opts.map(opt => ({ key: opt.id, label: this.$t(opt.name) }))
    },
    exportDataOptions () {
      return {
        downloadType: 'local',
        title: this.$t('aice.instance'),
        items: [
          { label: 'ID', key: 'id' },
          ...this.columns,
        ],
      }
    },
    groupActions () {
      if (this.embedded) {
        return this.instanceGroupActions
      }
      return [
        {
          label: this.$t('common.create'),
          action: () => {
            this.$router.push(this.llmRouteCtx.instanceCreatePath)
          },
          meta: () => ({
            buttonType: 'primary',
            validate: true,
          }),
        },
        ...this.instanceGroupActions,
      ]
    },
  },
  created () {
    this.$hM = new this.$Manager('hosts')
    this.serverManager = new this.$Manager('servers')
    if (!this.embedded) {
      this.initSidePageTab('detail')
    }
    this.list.fetchData()
  },
  methods: {
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
    getParam () {
      const ret = {
        ...this.getParams,
        llm_types: this.llmRouteCtx.llmTypes,
        details: true,
      }
      return ret
    },
    async hostFetcher () {
      const params = {
        details: false,
        host_type: 'container',
        field: [
          'id',
          'name',
        ],
      }
      const response = await this.$hM.list({ params })
      return {
        data: {
          host: (response.data?.data || []).map(item => item.name),
        },
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

<style>
</style>
