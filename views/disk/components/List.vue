
<template>
  <page-list
    show-tag-columns
    show-tag-filter
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions" />
</template>

<script>
import * as R from 'ramda'
import { MEDIUM_MAP } from '../../../constants'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { getTenantFilter, getStatusFilter, getBrandFilter, getNameFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'
import ListMixin from '@/mixins/list'

export default {
  name: 'DiskList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
    cloudEnv: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'disks',
        getParams: this.getParam,
        filterOptions: {
          name: getNameFilter(),
          status: getStatusFilter('disk'),
          storage: {
            label: '主存储',
            jointFilter: true,
          },
          guest: {
            label: this.$t('dictionary.server'),
          },
          disk_type: {
            label: '磁盘类型',
            dropdown: true,
            // multiple: true,
            items: [
              { label: '数据盘', key: 'data' },
              { label: '系统盘', key: 'sys' },
            ],
          },
          unused: {
            label: '是否挂载',
            dropdown: true,
            items: [
              { label: '是', key: false },
              { label: '否', key: true },
            ],
          },
          brand: getBrandFilter(),
          tenant: getTenantFilter(),
          medium_type: {
            label: '介质类型',
            dropdown: true,
            multiple: true,
            jointFilter: true,
            filter: true,
            formatter: val => {
              return `storages.id(storage_id).medium_type.equals(${val})`
            },
            items: Object.keys(MEDIUM_MAP).map((k) => {
              return { label: MEDIUM_MAP[k], key: k }
            }),
          },
        },
        steadyStatus: {
          status: Object.values(expectStatus.disk).flat(),
          guest_status: [...Object.values(expectStatus.server).flat(), '', undefined],
        },
        responseData: this.responseData,
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '容量', key: 'disk_size' },
          { label: '格式', key: 'disk_format' },
          { label: '磁盘类型', key: 'disk_type' },
          { label: '是否挂载', key: 'unused' },
          { label: '主机', key: 'guest' },
          { label: '主存储', key: 'storage' },
          { label: '创建时间', key: 'created_at' },
          { label: '状态', key: 'status' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: '平台', key: 'provider' },
          { label: '区域', key: 'region' },
          { label: '可用区', key: 'zone' },
          { label: '介质类型', key: 'medium_type' },
        ],
      },
      groupActions: [
        {
          label: '新建',
          actions: () => {
            return [
              {
                label: 'IDC',
                permission: 'disks_create',
                action: () => {
                  this.createDialog('DiskCreateDialog', {
                    title: '新建',
                    onManager: this.onManager,
                    diskType: 'idc',
                  })
                },
              },
              {
                label: '私有云',
                permission: 'disks_create',
                action: () => {
                  this.createDialog('DiskCreateDialog', {
                    title: '新建',
                    onManager: this.onManager,
                    diskType: 'private',
                  })
                },
              },
              {
                label: '公有云',
                permission: 'disks_create',
                action: () => {
                  this.createDialog('DiskCreateDialog', {
                    title: '新建',
                    onManager: this.onManager,
                    diskType: 'public',
                  })
                },
              },
            ]
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: '批量操作',
          actions: () => {
            return [
              {
                label: '同步状态',
                action: () => {
                  this.onManager('batchPerformAction', {
                    steadyStatus: ['running', 'ready'],
                    managerArgs: {
                      action: 'syncstatus',
                    },
                  })
                },
              },
              {
                label: '删除',
                permission: 'disks_delete',
                action: () => {
                  this.createDialog('DiskDeleteDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: '删除',
                    onManager: this.onManager,
                  })
                },
                meta: () => this.$getDeleteResult(this.list.selectedItems),
              },
            ]
          },
          meta: () => {
            return {
              validate: this.list.selected.length,
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
    this.initSidePageTab('disk-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = { ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams) }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'DiskSidePage', {
        id: row.id,
        resource: 'disks',
        getParams: this.getParam,
        steadyStatus: {
          status: Object.values(expectStatus.disk).flat(),
          guest_status: [...Object.values(expectStatus.server).flat(), '', undefined],
        },
      }, {
        list: this.list,
      })
    },
  },
}
</script>
