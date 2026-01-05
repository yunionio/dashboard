<template>
  <page-list
    show-tag-columns
    show-tag-columns2
    show-tag-filter
    :list="list"
    :columns="templateListColumns || columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions"
    :show-single-actions="!isTemplate"
    :show-page="!isTemplate" />
</template>

<script>
import { mapGetters } from 'vuex'
import ListMixin from '@/mixins/list'
import ResTemplateListMixin from '@/mixins/resTemplateList'
import { getNameFilter, getTenantFilter, getStatusFilter, getDomainFilter, getOsArchFilter, getDescriptionFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'
import { getSetPublicAction } from '@/utils/common/tableActions'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'HostImageList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin, ResTemplateListMixin],
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
        isTemplate: this.isTemplate,
        templateLimit: this.templateLimit,
        steadyStatus: Object.values(expectStatus.image).flat(),
        filterOptions: {
          id: {
            label: this.$t('table.title.id'),
          },
          name: getNameFilter(),
          description: getDescriptionFilter(),
          status: getStatusFilter('image'),
          projects: getTenantFilter(),
          project_domains: getDomainFilter(),
          os_arch: getOsArchFilter(),
        },
        responseData: this.responseData,
        hiddenColumns: ['metadata', 'created_at', 'is_standard'],
      }),
      groupActions: [
        getSetPublicAction(this, {
          name: this.$t('dictionary.guestimage'),
          scope: 'project',
          resource: 'guestimages',
        }, {
          permission: 'guestimages_perform_public,guestimages_perform_private',
          meta: () => {
            if (!this.list.selectedItems || this.list.selectedItems.length <= 0) {
              return {
                validate: false,
              }
            }
            if (this.list.selectedItems.some(item => item.is_standard)) {
              return {
                validate: false,
                tooltip: this.$t('compute.text_612'),
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
                label: this.$t('compute.perform_change_owner', [this.$t('dictionary.project')]),
                permission: 'guestimages_perform_change_owner',
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
                    ret.tooltip = this.$t('compute.text_613')
                    return ret
                  }
                  if (this.list.selectedItems.some(item => item.is_public)) {
                    ret.validate = false
                    ret.tooltip = this.$t('compute.text_614')
                    return ret
                  }
                  return ret
                },
              },
              {
                label: this.$t('table.action.set_tag'),
                permission: 'guestimages_perform_set_user_metadata',
                action: () => {
                  this.createDialog('SetTagDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    mode: 'add',
                    params: {
                      resources: 'guestimage',
                    },
                    tipName: this.$t('dictionary.guestimage'),
                  })
                },
              },
              {
                label: this.$t('common_277'),
                permission: 'guestimages_update',
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
                    tooltip: !validate && this.$t('compute.text_616'),
                  }
                },
              },
              {
                label: this.$t('compute.perform_delete'),
                permission: 'guestimages_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('compute.text_617'),
                    name: this.$t('dictionary.guestimage'),
                    onManager: this.onManager,
                    alert: this.$t('compute.text_1393'),
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
  computed: {
    ...mapGetters(['userInfo']),
    exportDataOptions () {
      return {
        items: this.columns,
        title: this.$t('dictionary.guestimage'),
        downloadType: 'local',
      }
    },
  },
  created () {
    this.initSidePageTab('host-image-detail')
    this.list.fetchData()
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
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'HostImageSidePage', {
        id: row.id,
        resource: 'guestimages',
        apiVersion: 'v1',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.image).flat(),
      }, {
        list: this.list,
        tab,
      })
    },
  },
}
</script>
