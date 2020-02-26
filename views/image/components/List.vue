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
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import GlobalSearchMixin from '@/mixins/globalSearch'

export default {
  name: 'ImageList',
  mixins: [WindowsMixin, GlobalSearchMixin, SingleActionsMixin, ColumnsMixin, ListMixin],
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
        resource: 'images',
        apiVersion: 'v1',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.image).flat(),
        filterOptions: {
          name: {
            label: '镜像名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          // status: getStatusFilter('image'),
          disk_format: {
            label: '镜像格式',
            dropdown: true,
            items: [
              { label: 'VMDK', key: 'vmdk' },
              { label: 'RAW', key: 'raw' },
              { label: 'VHD', key: 'vhd' },
              { label: 'QCOW2', key: 'qcow2' },
              { label: 'ISO', key: 'iso' },
            ],
          },
          is_standard: {
            label: '镜像类型',
            dropdown: true,
            items: [
              { label: '公共镜像', key: true },
              { label: '自定义镜像', key: false },
            ],
          },
          // tenant: getTenantFilter(),
          // os_type: getOsTypeFilter(),
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
          { label: '检验和', key: 'checksum' },
        ],
      },
    }
  },
  computed: {
    groupActions () {
      const ImageImport = {
        label: '镜像市场',
        permission: 'images_create',
        action: () => {
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.$router.push({ name: 'ImageImport' })
        },
        meta: () => ({
          buttonType: 'primary',
        }),
      }
      const ImageUpload = {
        label: '上传',
        permission: 'images_create',
        action: () => {
          this.createDialog('ImageUploadDialog', {
            title: '上传',
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
      }
      const batchActions = [
        {
          label: '批量操作',
          actions: obj => {
            return [
              {
                label: '设置删除保护',
                action: (row) => {
                  this.createDialog('ChangeDisableDelete', {
                    name: '系统镜像',
                    columns: this.columns,
                    onManager: this.onManager,
                    data: this.list.selectedItems,
                  })
                },
                meta: () => {
                  const validate = this.list.selectedItems.length > 0
                  return {
                    validate: validate,
                    tooltip: !validate && `请选择需要操作的系统镜像`,
                  }
                },
              },
              {
                label: '删除',
                permission: 'images_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: '删除镜像',
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  return this.$getDeleteResult(this.list.selectedItems)
                },
              },
            ]
          },
        },
      ]
      if (this.$appConfig.isPrivate) {
        if (this.$store.getters.scope !== 'project') {
          batchActions.unshift(ImageImport)
        }
        batchActions.unshift(ImageUpload)
      }
      return batchActions
    },
  },
  created () {
    this.initSidePageTab('system-image-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        details: true,
        is_guest_image: false,
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'SystemImageSidePage', {
        id: row.id,
        resource: 'images',
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
