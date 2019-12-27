<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
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

    const isStandard = status => status === true || status === 'true'

    return {
      isAdminMode: this.$store.getters.isAdminMode,
      isDomainMode: this.$store.getters.isDomainMode,
      userInfo: this.$store.getters.userInfo,
      list: this.$list.createList(this, {
        resource: 'images',
        apiVersion: 'v1',
        getParams: this.getParams,
        filterOptions: {
          name: {
            label: '镜像名称',
            filter: true,
            formatter: val => {
              return `name.contains(${val})`
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
      groupActions: [
        {
          label: '镜像市场',
          permission: 'images_create',
          action: () => {
            this.$router.push({ name: 'ImageImport' })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: '上传',
          permission: 'images_create',
          action: () => {
            this.createDialog('ImageUploadDialog', {
              title: '上传',
              list: this.list,
            })
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
                  if (this.isHostImage) {
                    return {
                      validate: false,
                    }
                  }
                  if (this.isAdminMode && obj.tenant !== 'system') {
                    return {
                      validate: false,
                      tooltip: '您不可以修改非本系统镜像',
                    }
                  }
                  return {
                    validate: !isStandard(obj.is_standard) && validateAction(obj),
                    tooltip: validateActionTooltip(obj),
                  }
                },
              },
              {
                label: '设置为自定义镜像',
                permission: 'images_update',
                action: () => {
                  this.updateStandard(false, [obj])
                },
                meta: () => {
                  if (this.isHostImage) {
                    return {
                      validate: false,
                    }
                  }
                  if (this.isAdminMode && obj.tenant !== 'system') {
                    return {
                      validate: false,
                      tooltip: '您不可以修改非本系统镜像',
                    }
                  }
                  return {
                    validate: isStandard(obj.is_standard) && validateAction(obj),
                    tooltip: validateActionTooltip(obj),
                  }
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
                  const ret = {
                    validate: false,
                    tooltip: validateActionTooltip(obj),
                  }
                  if (obj.is_standard) {
                    ret.tooltip = '公共镜像不支持设置'
                    return ret
                  }
                  if (!validateAction(obj)) return ret
                  // 1、管理后台视图可以对所有镜像进行操作；
                  // 2、域管理后台视图只能对该域下的镜像进行操作，不能对其他域共享的镜像进行操作；
                  // 3、项目视图只能对该项目下的镜像进行操作，不能对其他域、其他项目共享的镜像进行操作。
                  if (this.isAdminMode) {
                    ret.validate = true
                    ret.tooltip = ''
                    return ret
                  }
                  if (!this.isAdminMode && !this.isDomainAdmin) {
                    ret.validate = this.userInfo.projectId === obj.tenant_id
                    ret.tooltip = this.userInfo.projectId === obj.tenant_id ? '' : validateActionTooltip(obj)
                    return ret
                  }
                  if (this.isDomainMode) {
                    ret.validate = this.userInfo.projectDomainId === obj.domain_id
                    ret.tooltip = this.userInfo.projectDomainId === obj.domain_id ? '' : validateActionTooltip(obj)
                    return ret
                  }
                  return {
                    validate: true,
                    tooltip: '',
                  }
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
                  if (this.isDomainAdmin && obj.domain_id !== this.userInfo.projectDomainId) {
                    return {
                      validate: false,
                      tooltip: '域管理员只能删除本域下的镜像',
                    }
                  }
                  if (!validateAction(obj)) return { validate: false, tooltip: validateActionTooltip(obj) }
                  return this.$getDeleteResult(obj)
                },
              },
            ]
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('system-image-detail')
    this.list.fetchData()
  },
  methods: {
    getParams () {
      return {
        details: true,
        is_guest_image: false,
      }
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
