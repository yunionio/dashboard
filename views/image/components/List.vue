<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import { sizestr } from '@/utils/utils'
import { getStatusTableColumn, getNameDescriptionTableColumn, getProjectTableColumn, isPublicTableColumn, getTimeTableColumn } from '@/utils/common/tableColumn'
// import { getTenantFilter, getOsTypeFilter, getStatusFilter } from '@/utils/common/tableFilter'
import SystemIcon from '@/sections/SystemIcon'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ImageList',
  mixins: [WindowsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
    cloudEnv: String,
  },
  data () {
    const validateAction = function (obj) {
      if (obj.is_guest_image === true || obj.is_guest_image === 'true') {
        return false
      }
      return true
    }

    const validateActionTooltip = function (obj) {
      if (obj.is_guest_image === true || obj.is_guest_image === 'true') {
        return '主机镜像的子镜像无法操作'
      }
      return ''
    }

    const ownerDomain = list => this.$store.getters.isAdminMode || this.list.selectedItems.every(obj => obj.domain_id === this.$store.getters.userInfo.projectDomainId)

    const isOwnerProject = project => project === this.$store.getters.userInfo.projectId || project === this.$store.getters.userInfo.projectName

    return {
      isAdminMode: this.$store.getters.isAdminMode,
      isDomainMode: this.$store.getters.isDomainMode,
      userInfo: this.$store.getters.userInfo,
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'images',
        apiVersion: 'v1',
        getParams: this.getParam,
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
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '格式', key: 'disk_format' },
          { label: '镜像大小', key: 'size' },
          { label: '项目', key: 'tenant' },
          { label: '镜像类型', key: 'is_standard' },
          { label: '创建时间', key: 'created_at' },
          { label: '检验和', key: 'checksum' },
        ],
      },
      columns: [
        getNameDescriptionTableColumn({
          width: 200,
          vm: this,
          hideField: true,
          addLock: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.sidePageTriggerHandle(row.id, 'SystemImageSidePage') }>{ row.name }</side-page-trigger>
            )
          },
        }),
        {
          field: 'disk_format',
          title: '格式',
          width: 100,
          formatter: ({ cellValue }) => {
            return cellValue && cellValue.toUpperCase()
          },
        },
        {
          field: 'os_type',
          title: '系统',
          width: 60,
          slots: {
            default: ({ row }) => {
              if (!row.properties) return
              let name = row.properties.os_distribution ? decodeURI(row.properties.os_distribution) : row.properties.os_type || ''
              if (name.includes('Windows') || name.includes('windows')) {
                name = 'Windows'
              }
              const tooltip = (row.properties.os_version ? `${name} ${row.properties.os_version}` : name) || '未知'
              return [
                <SystemIcon tooltip={ tooltip } name={ name } />,
              ]
            },
          },
        },
        {
          field: 'size',
          title: '镜像大小',
          minWidth: 100,
          formatter: ({ cellValue }) => {
            return sizestr(cellValue, 'B', 1024)
          },
        },
        getStatusTableColumn({ statusModule: 'image' }),
        getProjectTableColumn(),
        isPublicTableColumn(),
        {
          field: 'is_standard',
          title: '镜像类型',
          width: 100,
          formatter: ({ cellValue }) => {
            if (cellValue) return '公共镜像'
            return '自定义镜像'
          },
        },
        getTimeTableColumn(),
      ],
      singleActions: [
        {
          label: '修改属性',
          permission: 'images_update',
          action: obj => {
            this.createDialog('ImageEditAttributesDialog', {
              data: [obj],
              columns: this.columns,
              list: this.list,
            })
          },
          meta: obj => {
            if (!validateAction(obj)) {
              return {
                validate: false,
                tooltip: validateActionTooltip(obj),
              }
            }
            if (this.isAdminMode) {
              return {
                validate: true,
              }
            } else if (this.isDomainMode) {
              return {
                validate: ownerDomain(this.list),
                tooltip: '非当前域下面的镜像无法修改属性',
              }
            }
            return {
              validate: isOwnerProject(obj.tenant_id),
              tooltip: !isOwnerProject(obj.tenant_id) ? '非当前项目下面的镜像无法修改属性' : '',
            }
          },
        },
        {
          label: '更多',
          actions: obj => {
            return [
              {
                label: '设置为公共镜像',
                permission: 'images_update',
                action: () => {
                  this.updateStandard(true, [obj])
                },
                meta: () => {
                  let ret = {
                    validate: false,
                    tooltip: '',
                  }
                  const actions = new Map([
                    ['admin', () => {
                      if (obj.is_standard) {
                        ret.tooltip = '公共镜像不支持该操作'
                      }
                      return ret
                    }],
                    ['domain', () => {
                      ret.tooltip = '只有系统管理员支持该操作'
                      return ret
                    }],
                    ['user', () => {
                      ret.tooltip = '只有系统管理员支持该操作'
                      return ret
                    }],
                  ])
                  let action = actions.get(this.isAdminMode ? 'admin' : '') || actions.get(this.isDomainMode ? 'domain' : 'user')
                  ret = action.call(this)
                  if (ret.tooltip) return ret
                  return { validate: true, tooltip: '' }
                },
              },
              {
                label: '设置为自定义镜像',
                permission: 'images_update',
                action: () => {
                  this.updateStandard(false, [obj])
                },
                meta: () => {
                  let ret = {
                    validate: false,
                    tooltip: '',
                  }
                  const actions = new Map([
                    ['admin', () => {
                      if (!obj.is_standard) {
                        ret.tooltip = '自定义镜像不支持该操作'
                      }
                      return ret
                    }],
                    ['domain', () => {
                      ret.tooltip = '只有系统管理员支持该操作'
                      return ret
                    }],
                    ['user', () => {
                      ret.tooltip = '只有系统管理员支持该操作'
                      return ret
                    }],
                  ])
                  let action = actions.get(this.isAdminMode ? 'admin' : '') || actions.get(this.isDomainMode ? 'domain' : 'user')
                  ret = action.call(this)
                  if (ret.tooltip) return ret
                  return { validate: true, tooltip: '' }
                },
              },
              {
                label: '设置共享',
                permission: 'images_perform_public',
                action: () => {
                  this.createDialog('SetPublicDialog', {
                    data: [obj],
                    columns: this.columns,
                    list: this.list,
                  })
                },
                meta: () => {
                  let ret = {
                    validate: false,
                    tooltip: '',
                  }
                  const actions = new Map([
                    ['admin', () => {
                      if (obj.is_standard) {
                        ret.tooltip = '公共镜像不支持该操作'
                      }
                      return ret
                    }],
                    ['domain', () => {
                      if (obj.is_standard) {
                        ret.tooltip = '公共镜像不支持该操作'
                        return ret
                      }
                      if (obj.public_scope === 'system') {
                        ret.tooltip = '系统共享镜像不支持该操作'
                        return ret
                      }
                      return ret
                    }],
                    ['user', () => {
                      ret.tooltip = '只有管理员支持该操作'
                      if (!obj.is_standard && obj.public_scope === 'system') {
                        ret.tooltip = '只有系统管理员支持该操作'
                        return ret
                      }
                      return ret
                    }],
                  ])
                  let action = actions.get(this.isAdminMode ? 'admin' : '') || actions.get(this.isDomainMode ? 'domain' : 'user')
                  ret = action.call(this)
                  if (ret.tooltip) return ret
                  return { validate: true, tooltip: '' }
                },
              },
              {
                label: '设置删除保护',
                action: (row) => {
                  this.createDialog('ChangeDisableDelete', {
                    name: '系统镜像',
                    columns: this.columns,
                    list: this.list,
                    data: [row],
                  })
                },
              },
              {
                label: '删除',
                permission: 'images_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    data: [obj],
                    columns: this.columns,
                    title: '删除',
                    list: this.list,
                    success: () => {
                      this.destroySidePages()
                    },
                  })
                },
                meta: () => {
                  let ret = {
                    validate: false,
                    tooltip: '',
                  }
                  const actions = new Map([
                    ['admin', () => {
                      if (obj.is_standard) {
                        ret.tooltip = '公共镜像禁止删除，请切换为自定义镜像后重试'
                        if (obj.is_public && obj.public_scope === 'system') {
                          ret.tooltip = '公共镜像禁止删除，请切换为自定义镜像且取消共享后重试'
                          return ret
                        }
                        return ret
                      } else {
                        if (obj.shared_projects) {
                          ret.tooltip = '共享镜像禁止删除，请取消共享后重试'
                          return ret
                        }
                      }
                      if (obj.is_public) {
                        ret.tooltip = '共享镜像禁止删除，请取消共享后重试'
                        return ret
                      }
                      if (obj.disable_delete && obj.protected) {
                        ret.tooltip = '删除保护，如需解除，请点击【设置删除保护】'
                        return ret
                      }
                      return ret
                    }],
                    ['domain', () => {
                      if (obj.is_standard) {
                        ret.tooltip = '公共镜像禁止删除'
                        return ret
                      } else {
                        if (obj.shared_projects) {
                          ret.tooltip = '共享镜像禁止删除，请取消共享后重试'
                          return ret
                        }
                      }
                      if (obj.is_public) {
                        if (obj.public_scope === 'domain') {
                          ret.tooltip = '共享镜像禁止删除，请取消共享后重试'
                        } else {
                          ret.tooltip = '系统共享镜像禁止删除'
                        }
                        return ret
                      } else {
                        if (obj.shared_projects) {
                          ret.tooltip = '共享镜像禁止删除，请取消共享后重试'
                          return ret
                        }
                      }
                      if (obj.disable_delete && obj.protected) {
                        ret.tooltip = '删除保护，如需解除，请点击【设置删除保护】'
                        return ret
                      }
                      return ret
                    }],
                    ['user', () => {
                      if (obj.is_standard) {
                        ret.tooltip = '公共镜像禁止删除'
                        return ret
                      } else {
                        if (obj.shared_projects) {
                          ret.tooltip = '共享镜像禁止删除'
                          return ret
                        }
                      }
                      if (obj.is_public) {
                        ret.tooltip = '共享镜像禁止删除'
                        return ret
                      }
                      if (obj.disable_delete && obj.protected) {
                        ret.tooltip = '删除保护，如需解除，请点击【设置删除保护】'
                        return ret
                      }
                      return ret
                    }],
                  ])
                  let action = actions.get(this.isAdminMode ? 'admin' : '') || actions.get(this.isDomainMode ? 'domain' : 'user')
                  ret = action.call(this)
                  if (ret.tooltip) return ret
                  return this.$getDeleteResult(obj)
                },
              },
            ]
          },
        },
      ],
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
            list: this.list,
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
                    list: this.list,
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
                    list: this.list,
                  })
                },
                meta: () => this.$getDeleteResult(this.list.selectedItems),
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
    updateStandard (isStandard, selectedItems) {
      let params = {
        is_standard: isStandard,
      }
      if (selectedItems.length > 1) {
        this.list.batchPerformAction('mark-standard', params, this.list.steadyStatus)
      } else {
        params.id = selectedItems[0].id
        this.list.singlePerformAction('mark-standard', params)
      }
    },
  },
}
</script>
