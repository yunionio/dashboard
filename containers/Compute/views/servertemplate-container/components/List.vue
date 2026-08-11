<template>
  <page-list
    :list="list"
    :columns="templateListColumns || columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :showSearchbox="showSearchbox"
    :show-group-actions="showGroupActions"
    :show-single-actions="isTemplate ? false : showSingleActions"
    :export-data-options="exportDataOptions"
    :show-page="!isTemplate" />
</template>

<script>
import expectStatus from '@/constants/expectStatus'
import { getNameFilter, getTenantFilter, getStatusFilter, getBrandFilter, getDomainFilter, getOsArchFilter, getRegionFilter, getDescriptionFilter, getCreatedAtFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import ResTemplateListMixin from '@/mixins/resTemplateList'
import GlobalSearchMixin from '@/mixins/globalSearch'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'ServertemplateContainerList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin, ResTemplateListMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
    cloudEnv: String,
    showGroupActions: {
      type: Boolean,
      default: () => (true),
    },
    showSingleActions: {
      type: Boolean,
      default: () => (true),
    },
    cloudEnvOptions: {
      type: Array,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'servertemplates',
        ctx: this,
        getParams: this.getParam,
        isTemplate: this.isTemplate,
        templateLimit: this.templateLimit,
        steadyStatus: Object.values(expectStatus.servertemplate).flat(),
        filterOptions: {
          id: {
            label: this.$t('table.title.id'),
          },
          name: getNameFilter(),
          description: getDescriptionFilter(),
          projects: getTenantFilter(),
          project_domains: getDomainFilter(),
          status: getStatusFilter('servertemplate'),
          brand: getBrandFilter(),
          os_type: {
            label: this.$t('table.title.os'),
            dropdown: true,
            multiple: true,
            items: [
              { label: 'Windows', key: 'windows' },
              { label: 'Linux', key: 'linux' },
              { label: 'VMware', key: 'VMWare' },
            ],
            filter: true,
            formatter: val => {
              return `os_type.in(${val})`
            },
          },
          vpc: {
            label: 'VPC',
          },
          region: getRegionFilter(),
          billing_type: {
            label: this.$t('table.title.bill_type'),
            dropdown: true,
            items: Object.keys(this.$t('billingType')).map((k) => {
              return {
                label: this.$t('billingType')[k],
                key: k,
              }
            }),
          },
          os_arch: getOsArchFilter(),
          created_at: getCreatedAtFilter(),
        },
        hiddenColumns: ['os_type', 'os_arch', 'created_at'],
        // 暂无真实接口，列表不发送请求
        responseData: { data: [] },
      }),
      groupActions: [
        {
          label: this.$t('compute.perform_create'),
          permission: 'servertemplates_create',
          action: () => {
            this.$router.push({
              path: '/servertemplate-container/create',
              query: {
                type: this.cloudEnv === 'onpremise' ? 'idc' : this.cloudEnv || this._cloudEnv,
                source: 'servertemplate',
              },
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
              validate: !!this._cloudEnv,
            }
          },
        },
        {
          label: this.$t('compute.perform_delete'),
          permission: 'servertemplates_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('compute.perform_delete'),
              name: this.$t('compute.servertemplate_container'),
              onManager: this.onManager,
            })
          },
          meta: () => this.$getDeleteResult(this.list.selectedItems),
        },
      ],
    }
  },
  computed: {
    _cloudEnv () {
      if (this.cloudEnvOptions && this.cloudEnvOptions.length > 0) {
        const idc = this.cloudEnvOptions.find(item => item.key === 'idc')
        if (idc && idc.key) {
          return idc.key
        }
        const item = this.cloudEnvOptions.find(item => item.key) || {}
        return item.key
      }
      return ''
    },
    exportDataOptions () {
      return {
        downloadType: 'local',
        title: this.$t('compute.servertemplate_container'),
        items: [
          { field: 'id', title: 'ID' },
          ...this.columns,
        ],
      }
    },
  },
  watch: {
    cloudEnv () {
      this.$nextTick(() => {
        this.list.fetchData(0)
      })
    },
  },
  created () {
    this.list.fetchData()
    this.initSidePageTab('servertemplate-detail')
  },
  methods: {
    getParam () {
      const ret = {
        details: true,
        ...this.getParams,
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'ServertemplateContainerSidePage', {
        id: row.id,
        resource: 'servertemplates',
        getParams: this.getParam,
      }, {
        list: this.list,
        tab,
      })
    },
  },
}
</script>
