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
import { mapGetters } from 'vuex'
import * as R from 'ramda'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import GlobalSearchMixin from '@/mixins/globalSearch'
// import { getSetPublicAction } from '@/utils/common/tableActions'

export default {
  name: 'ImageList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
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
          disk_formats: {
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
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo']),
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
              // getSetPublicAction(this, {
              //   name: this.$t('dictionary.image'),
              //   scope: 'project',
              //   resource: 'images',
              //   apiVersion: 'v1',
              // }, {
              //   meta: () => {
              //     let ret = {
              //       validate: false,
              //       tooltip: '',
              //     }
              //     const actions = new Map([
              //       ['admin', () => {
              //         if (this.list.selectedItems.some(item => this.booleanTransfer(item.is_standard))) {
              //           ret.tooltip = '公共镜像不支持该操作'
              //         }
              //         return ret
              //       }],
              //       ['domain', () => {
              //         if (this.list.selectedItems.some(item => this.booleanTransfer(item.is_standard))) {
              //           ret.tooltip = '公共镜像不支持该操作'
              //           return ret
              //         }
              //         if (this.list.selectedItems.some(item => item.public_scope === 'system')) {
              //           ret.tooltip = '系统共享镜像不支持该操作'
              //           return ret
              //         }
              //         return ret
              //       }],
              //       ['user', () => {
              //         ret.tooltip = '只有管理员支持该操作'
              //         if (this.list.selectedItems.some(item => !this.booleanTransfer(item.is_standard) && item.public_scope === 'system')) {
              //           ret.tooltip = '只有系统管理员支持该操作'
              //           return ret
              //         }
              //         return ret
              //       }],
              //     ])
              //     const action = actions.get(this.isAdminMode ? 'admin' : '') || actions.get(this.isDomainMode ? 'domain' : 'user')
              //     ret = action.call(this)
              //     if (ret.tooltip) return ret
              //     return { validate: true }
              //   },
              // }),
              {
                label: `更改${this.$t('dictionary.project')}`,
                action: () => {
                  this.createDialog('ChangeOwenrDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    name: this.$t('dictionary.image'),
                    resource: 'images',
                    apiVersion: 'v1',
                  })
                },
                meta: () => {
                  const ret = {
                    validate: true,
                    tooltip: null,
                  }
                  if (!this.isAdminMode && !this.isDomainMode) {
                    ret.validate = false
                    ret.tooltip = '只有管理员支持该操作'
                    return ret
                  }
                  if (this.list.selectedItems.some(item => item.is_public)) {
                    ret.validate = false
                    ret.tooltip = '只有不共享的镜像支持该操作'
                    return ret
                  }
                  return ret
                },
              },
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
                    tooltip: !validate && '请选择需要操作的系统镜像',
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
                    name: this.$t('dictionary.image'),
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  const ret = {
                    validate: false,
                    tooltip: '',
                  }
                  const someStandard = this.list.selectedItems.some((item) => {
                    return this.booleanTransfer(item.is_standard)
                  })
                  const someDisableDelete = this.list.selectedItems.some((item) => {
                    return this.booleanTransfer(item.disable_delete) && this.booleanTransfer(item.protected)
                  })
                  if (this.isAdminMode) {
                    if (someStandard) {
                      ret.tooltip = '公共镜像禁止删除，请切换为自定义镜像后重试'
                      return ret
                    }
                  } else if (this.isDomainMode) {
                    const allOwnerDomain = this.list.selectedItems.every((item) => {
                      return item.domain_id === this.userInfo.projectDomainId
                    })
                    if (someStandard) {
                      ret.tooltip = '公共镜像禁止删除'
                      return ret
                    }
                    if (!allOwnerDomain) {
                      ret.tooltip = '非当前域下的镜像无法删除'
                      return ret
                    }
                  } else {
                    const allOwnerProject = this.list.selectedItems.every((item) => {
                      return item.tenant_id === this.userInfo.projectId
                    })
                    if (someStandard) {
                      ret.tooltip = '公共镜像禁止删除'
                      return ret
                    }
                    if (!allOwnerProject) {
                      ret.tooltip = '非当前项目下的镜像无法删除'
                      return ret
                    }
                  }
                  if (someDisableDelete) {
                    ret.tooltip = '删除保护，如需解除，请点击【设置删除保护】'
                    return ret
                  }
                  return this.$getDeleteResult(this.list.selectedItems)
                },
              },
            ]
          },
          meta: () => {
            return {
              validate: this.list.selectedItems && this.list.selectedItems.length > 0,
            }
          },
        },
      ]
      if (this.$appConfig.isPrivate) {
        if (this.isAdminMode) {
          batchActions.unshift(ImageImport)
        }
      }
      batchActions.unshift(ImageUpload)
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
    booleanTransfer (val) {
      if (R.is(String, val)) {
        return val === 'true'
      }
      return val
    },
  },
}
</script>
