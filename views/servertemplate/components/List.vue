<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :show-group-actions="showGroupActions"
    :show-single-actions="showSingleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import expectStatus from '@/constants/expectStatus'
import { getTenantFilter, getStatusFilter, getBrandFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'ServertemplateList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
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
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'servertemplates',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.scalinggroup).flat(),
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          tenant: getTenantFilter(),
          status: getStatusFilter('servertemplate'),
          brand: getBrandFilter(),
          os_type: {
            label: '系统类型',
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
          region: {
            label: '区域',
          },
          billing_type: {
            label: '计费类型',
            dropdown: true,
            items: Object.keys(this.$t('billingType')).map((k) => {
              return {
                label: this.$t('billingType')[k],
                key: k,
              }
            }),
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: '创建时间', key: 'created_at' },
        ],
      },
      groupActions: [
        {
          label: '新建',
          permission: 'servertemplates_create',
          action: () => {
            this.$router.push({
              path: '/servertemplate/create',
              query: {
                type: this.cloudEnv === 'onpremise' ? 'idc' : this.cloudEnv || 'idc',
                source: 'servertemplate',
              },
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: '删除',
          permission: 'servertemplates_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: '删除',
              name: this.$t('dictionary.servertemplate'),
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
      ],
    }
  },
  watch: {
    cloudEnv (val) {
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
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'ServertemplateSidePage', {
        id: row.id,
        resource: 'servertemplates',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
