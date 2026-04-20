<template>
  <page-list
    show-tag-filter
    :show-searchbox="true"
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
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
import { LLM_TYPE_OPTIONS } from '../../llm-sku/llmTypeConfig'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'PhoneList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
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
          status: (data) => {
            if (Object.values(expectStatus.server).flat().includes(data.status) || Object.values(expectStatus.container).flat().includes(data.llm_status)) {
              return false
            }
            return true
          },
        },
        filterOptions: {
          id: {
            label: this.$t('table.title.id'),
          },
          name: getNameFilter(),
          llm_type: {
            label: this.isApplyType ? this.$t('aice.llm_type.app') : this.$t('aice.llm_type.llm'),
            dropdown: true,
            items: LLM_TYPE_OPTIONS.map(opt => ({ key: opt.id, label: this.$t(opt.name) })),
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
      groupActions: [
        {
          label: this.$t('common.create'),
          action: () => {
            this.$router.push(this.isApplyType ? '/app-llm/create' : '/llm/create')
          },
          meta: () => {
            return {
              buttonType: 'primary',
              validate: true,
            }
          },
        },
        // 开机
        {
          label: this.$t('compute.text_272'),
          action: () => {
            this.createDialog('LlmBatchConfirmDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
              action: 'start',
              actionText: this.$t('compute.text_272'),
              steadyStatus: 'running',
            })
          },
          meta: () => {
            let ret = {
              validate: true,
              tooltip: null,
            }
            ret.validate = this.list.selectedItems.length > 0
            if (!ret.validate) return ret
            ret = this.$isValidateResourceLock(this.list.selectedItems, () => {
              ret.validate = this.list.selectedItems.every(item => item.status === 'ready')
              return ret
            })
            return ret
          },
          // hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_start'),
        },
        // 重启
        {
          label: this.$t('compute.text_274'),
          permission: 'llms_perform_restart',
          action: () => {
            this.createDialog('LlmBatchConfirmDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
              action: 'restart',
              actionText: this.$t('compute.text_274'),
              steadyStatus: 'running',
            })
          },
          meta: () => {
            let ret = {
              validate: true,
              tooltip: null,
            }
            ret.validate = this.list.selectedItems.length > 0
            if (!ret.validate) return ret
            ret = this.$isValidateResourceLock(this.list.selectedItems, () => {
              ret.validate = this.list.selectedItems.every(item => ['running', 'stop_fail', 'ready'].includes(item.status))
              return ret
            })
            return ret
          },
        },
        // 同步状态
        {
          label: this.$t('common.text00043'),
          action: () => {
            this.onManager('batchPerformAction', {
              steadyStatus: ['running', 'ready'],
              managerArgs: {
                action: 'syncstatus',
              },
            })
          },
          meta: () => {
            return {
              validate: this.list.selectedItems.length > 0,
            }
          },
        },
        /* 批量操作 */
        {
          label: this.$t('compute.text_275'),
          actions: () => {
            return [
              // 更改项目
              {
                label: this.$t('compute.perform_change_owner', [this.$t('dictionary.project')]),
                permission: 'llms_perform_public',
                action: (obj) => {
                  this.createDialog('ChangeOwenrDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                    resource: 'llms',
                  })
                },
                meta: () => {
                  const ret = {
                    validate: true,
                    tooltip: null,
                  }
                  ret.validate = this.list.selectedItems.length > 0
                  return ret
                },
              },
              // 关机
              {
                label: this.$t('compute.text_273'),
                permission: 'llms_perform_stop',
                action: () => {
                  this.createDialog('LlmBatchConfirmDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    action: 'stop',
                    actionText: this.$t('compute.text_273'),
                    steadyStatus: 'ready',
                  })
                },
                meta: () => {
                  let ret = {
                    validate: true,
                    tooltip: null,
                  }
                  ret.validate = this.list.selectedItems.length > 0
                  if (!ret.validate) return ret
                  ret = this.$isValidateResourceLock(this.list.selectedItems, () => {
                    ret.validate = this.list.selectedItems.every(item => item.status === 'running')
                    return ret
                  })
                  return ret
                },
                // hidden: () => this.$isScopedPolicyMenuHidden('vminstance_hidden_menus.server_perform_stop'),
              },
              // // 安装秒装应用
              // {
              //   label: this.$t('aice.instant_app.install'),
              //   action: () => {
              //     this.createDialog('PhoneAppInstallConfirmDialog', {
              //       vm: this,
              //       data: this.list.selectedItems,
              //       columns: this.columns,
              //       title: this.$t('aice.instant_app.install'),
              //       name: this.$t('aice.instant_app'),
              //       action: this.$t('aice.instant_app.install'),
              //       actionText: this.$t('aice.instant_app.install'),
              //     })
              //   },
              //   meta: () => {
              //     let ret = {
              //       validate: true,
              //       tooltip: null,
              //     }
              //     ret.validate = this.list.selectedItems.length > 0
              //     if (!ret.validate) return ret
              //     ret = this.$isValidateResourceLock(this.list.selectedItems, () => {
              //       ret.validate = this.list.selectedItems.every(item => ['running', 'ready'].includes(item.status))
              //       return ret
              //     })
              //     return ret
              //   },
              // },
              // 删除
              {
                label: this.$t('table.action.delete'),
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('table.action.delete'),
                    name: this.$t('aice.llm'),
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  const ret = { validate: this.list.selected.length }
                  if (this.list.selectedItems.some(item => !item.can_delete)) {
                    ret.validate = false
                    return ret
                  }
                  return ret
                },
              },
            ]
          },
        },
      ],
    }
  },
  computed: {
    isApplyType () {
      return this.$route.path.includes('app-llm')
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
  },
  created () {
    this.$hM = new this.$Manager('hosts')
    this.serverManager = new this.$Manager('servers')
    this.initSidePageTab('detail')
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
        llm_types: this.isApplyType ? ['dify', 'openclaw', 'comfyui', 'hermes-agent'] : ['vllm', 'ollama'],
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
