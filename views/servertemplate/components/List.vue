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
import { getTenantFilter, getStatusFilter, getBrandFilter, getDomainFilter } from '@/utils/common/tableFilter'
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
    cloudEnvOptions: {
      type: Array,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'servertemplates',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.servertemplate).flat(),
        filterOptions: {
          name: {
            label: this.$t('compute.text_228'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          projects: getTenantFilter(),
          project_domains: getDomainFilter(),
          status: getStatusFilter('servertemplate'),
          brand: getBrandFilter(),
          os_type: {
            label: this.$t('compute.text_721'),
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
            label: this.$t('compute.text_177'),
          },
          billing_type: {
            label: this.$t('compute.text_1046'),
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
          { label: this.$t('compute.text_228'), key: 'name' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: this.$t('compute.text_243'), key: 'created_at' },
        ],
      },
      groupActions: [
        {
          label: this.$t('compute.text_18'),
          permission: 'servertemplates_create',
          action: () => {
            this.$router.push({
              path: '/servertemplate/create',
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
          label: this.$t('compute.text_261'),
          permission: 'servertemplates_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('compute.text_261'),
              name: this.$t('dictionary.servertemplate'),
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
