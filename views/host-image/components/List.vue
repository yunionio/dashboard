<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import { getTenantFilter, getStatusFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'

export default {
  name: 'HostImageList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'guestimages',
        apiVersion: 'v1',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.image).flat(),
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          status: getStatusFilter('image'),
          tenant: getTenantFilter(),
        },
        responseData: this.responseData,
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '格式', key: 'disk_format' },
          { label: '镜像大小', key: 'size' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: '镜像类型', key: 'is_standard' },
          { label: '创建时间', key: 'created_at' },
        ],
      },
      groupActions: [
        {
          label: '设置删除保护',
          action: (row) => {
            this.createDialog('ChangeDisableDelete', {
              name: '主机镜像',
              columns: this.columns,
              onManager: this.onManager,
              data: this.list.selectedItems,
            })
          },
          meta: () => {
            const validate = this.list.selectedItems.length > 0
            return {
              validate: validate,
              tooltip: !validate && `请选择需要操作的主机镜像`,
            }
          },
        },
        {
          label: '删除',
          permission: 'images_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: '删除镜像',
              onManager: this.onManager,
              requestData: {
                override_pending_delete: true,
              },
            })
          },
          meta: () => this.$getDeleteResult(this.list.selectedItems),
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('host-image-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        details: true,
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'HostImageSidePage', {
        id: row.id,
        resource: 'guestimages',
        apiVersion: 'v1',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.image).flat(),
      }, {
        list: this.list,
      })
    },
  },
}
</script>
