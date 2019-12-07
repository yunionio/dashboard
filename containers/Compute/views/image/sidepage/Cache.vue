<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import { getStatusTableColumn, getTimeTableColumn, getBrandTableColumn, getRegionTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'systemImageCacheList',
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
    return {
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
        },
      }),
      columns: [
        {
          field: 'name',
          title: '名称',
        },
        getStatusTableColumn({ statusModule: 'image' }),
        getTimeTableColumn(),
        getTimeTableColumn({ title: '更新时间' }),
        getBrandTableColumn(),
        getRegionTableColumn(),
        {
          field: 'disk_format',
          title: '云账号',
        },
      ],
      groupActions: [
        {
          label: '新建',
          permission: 'images_create',
          action: () => {
            this.$router.push({ name: 'ImageImport' })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
      ],
      singleActions: [
        {
          label: '删除',
          permission: 'images_delete',
          action: (obj) => {
            this.createDialog('DeleteResDialog', {
              data: [obj],
              columns: this.columns,
              title: '删除',
              list: this.list,
            })
          },
          meta: (obj) => {
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
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
