<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import { BAND_WIDTH_OPTION } from '../../../constants'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import { getDomainChangeOwnerAction, getSetPublicAction } from '@/utils/common/tableActions'
import { getProjectDomainFilter } from '@/utils/common/tableFilter'

export default {
  name: 'WireList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
    cloudEnv: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'wires',
        getParams: this.getParam,
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          bandwidth: {
            label: '宽带',
            dropdown: true,
            multiple: true,
            items: BAND_WIDTH_OPTION.map(({ label, value }) => {
              return { label, key: value }
            }),
          },
          vpc: {
            label: '专有网络',
          },
          region: {
            label: '区域',
          },
          project_domain: getProjectDomainFilter(),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '带宽', key: 'bandwidth' },
          { label: '专有网络', key: 'vpc' },
          { label: '网络数量', key: 'networks' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: '平台', key: 'provider' },
          { label: '云账号', key: 'manager' },
          { label: '共享范围', key: 'public_scope' },
          { label: `所属${this.$t('dictionary.domain')}`, key: 'project_domain' },
        ],
      },
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('WireCreateDialog', {
              title: '新建',
              onManager: this.onManager,
            })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: this.$t('common.batchAction'),
          actions: () => {
            return [
              getDomainChangeOwnerAction(this, {
                name: this.$t('dictionary.wire'),
                resource: 'wires',
              }),
              getSetPublicAction(this, {
                name: this.$t('dictionary.wire'),
                scope: 'domain',
              }),
              {
                label: '删除',
                permission: 'wires_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: '删除',
                    name: this.$t('dictionary.hostwire'),
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  return {
                    validate: this.list.allowDelete(),
                  }
                },
              },
            ]
          },
          meta: () => {
            return {
              validate: this.list.selectedItems && this.list.selectedItems.length,
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
    this.initSidePageTab('wire-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        details: true,
        show_emulated: false,
        ...this.getParams,
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'WireSidePage', {
        id: row.id,
        resource: 'wires',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
