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
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import { getTenantFilter, getStatusFilter, getDomainFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'
import { getSetPublicAction } from '@/utils/common/tableActions'

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
    const validateAction = function (obj) {
      if (obj.is_guest_image === true || obj.is_guest_image === 'true') {
        return false
      }
      return true
    }
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
          projects: getTenantFilter(),
          domain: getDomainFilter(),
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
        getSetPublicAction(this, {
          name: this.$t('dictionary.guestimage'),
          scope: 'project',
          resource: 'guestimages',
        }, {
          permission: 'images_perform_public',
          meta: () => {
            if (!this.list.selectedItems || this.list.selectedItems.length <= 0) {
              return {
                validate: false,
              }
            }
            if (this.list.selectedItems.some(item => item.is_standard)) {
              return {
                validate: false,
                tooltip: '公共镜像不支持设置',
              }
            }
            if (this.list.selectedItems.some(item => !validateAction(item))) {
              return {
                validate: false,
              }
            }
            // 1、管理后台视图可以对所有镜像进行操作；
            // 2、域管理后台视图只能对该域下的镜像进行操作，不能对其他域共享的镜像进行操作；
            // 3、项目视图只能对该项目下的镜像进行操作，不能对其他域、其他项目共享的镜像进行操作。
            if (this.isAdminMode) {
              return {
                validate: true,
              }
            }
            if (!this.isAdminMode && !this.isDomainAdmin) {
              if (this.list.selectedItems.some(item => this.userInfo.projectId !== item.tenant_id)) {
                return {
                  validate: false,
                }
              }
            }
            if (this.isDomainAdmin) {
              if (this.list.selectedItems.some(item => this.userInfo.projectDomainId !== item.domain_id)) {
                return {
                  validate: false,
                }
              }
            }
            return {
              validate: true,
            }
          },
        }),
        {
          label: this.$t('common.batchAction'),
          actions: () => {
            return [
              {
                label: `更改${this.$t('dictionary.project')}`,
                action: () => {
                  this.createDialog('ChangeOwenrDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    name: this.$t('dictionary.guestimage'),
                    resource: 'guestimages',
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
                action: () => {
                  this.createDialog('ChangeDisableDelete', {
                    name: this.$t('dictionary.guestimage'),
                    columns: this.columns,
                    onManager: this.onManager,
                    data: this.list.selectedItems,
                  })
                },
                meta: () => {
                  const validate = this.list.selectedItems.length > 0
                  return {
                    validate: validate,
                    tooltip: !validate && '请选择需要操作的主机镜像',
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
                    name: this.$t('dictionary.guestimage'),
                    onManager: this.onManager,
                    requestData: {
                      override_pending_delete: true,
                    },
                  })
                },
                meta: () => this.$getDeleteResult(this.list.selectedItems),
              },
            ]
          },
          meta: () => {
            return {
              validate: this.list.selectedItems && this.list.selectedItems.length > 0,
            }
          },
        },
      ],
    }
  },
  compute: {
    ...mapGetters(['userInfo']),
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
