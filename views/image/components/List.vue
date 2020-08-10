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
import { getTenantFilter, getDomainFilter } from '@/utils/common/tableFilter'

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
            label: this.$t('compute.text_627'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          // status: getStatusFilter('image'),
          disk_formats: {
            label: this.$t('compute.text_640'),
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
            label: this.$t('compute.text_611'),
            dropdown: true,
            items: [
              { label: this.$t('compute.text_620'), key: true },
              { label: this.$t('compute.text_621'), key: false },
            ],
          },
          projects: getTenantFilter(),
          project_domains: getDomainFilter(),
          // tenant: getTenantFilter(),
          // os_type: getOsTypeFilter(),
        },
        responseData: this.responseData,
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('compute.text_228'), key: 'name' },
          { label: this.$t('compute.text_398'), key: 'disk_format' },
          { label: this.$t('compute.text_610'), key: 'size' },
          { label: this.$t('dictionary.project'), key: 'tenant' },
          { label: this.$t('compute.text_611'), key: 'is_standard' },
          { label: this.$t('compute.text_243'), key: 'created_at' },
          { label: this.$t('compute.text_641'), key: 'checksum' },
        ],
      },
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo']),
    groupActions () {
      const ImageImport = {
        label: this.$t('compute.text_642'),
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
        label: this.$t('compute.text_643'),
        permission: 'images_create',
        action: () => {
          this.createDialog('ImageUploadDialog', {
            title: this.$t('compute.text_643'),
            onManager: this.onManager,
            refresh: this.refresh,
          })
        },
      }
      const batchActions = [
        {
          label: this.$t('compute.text_275'),
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
              //           ret.tooltip = this.$t('compute.text_644')
              //         }
              //         return ret
              //       }],
              //       ['domain', () => {
              //         if (this.list.selectedItems.some(item => this.booleanTransfer(item.is_standard))) {
              //           ret.tooltip = this.$t('compute.text_644')
              //           return ret
              //         }
              //         if (this.list.selectedItems.some(item => item.public_scope === 'system')) {
              //           ret.tooltip = this.$t('compute.text_645')
              //           return ret
              //         }
              //         return ret
              //       }],
              //       ['user', () => {
              //         ret.tooltip = this.$t('compute.text_613')
              //         if (this.list.selectedItems.some(item => !this.booleanTransfer(item.is_standard) && item.public_scope === 'system')) {
              //           ret.tooltip = this.$t('compute.text_646')
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
                label: this.$t('compute.text_279', [this.$t('dictionary.project')]),
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
                label: this.$t('compute.text_615'),
                action: (row) => {
                  this.createDialog('ChangeDisableDelete', {
                    name: this.$t('compute.text_97'),
                    columns: this.columns,
                    onManager: this.onManager,
                    data: this.list.selectedItems,
                  })
                },
                meta: () => {
                  const validate = this.list.selectedItems.length > 0
                  return {
                    validate: validate,
                    tooltip: !validate && this.$t('compute.text_647'),
                  }
                },
              },
              {
                label: this.$t('compute.text_261'),
                permission: 'images_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('compute.text_617'),
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
                      ret.tooltip = this.$t('compute.text_648')
                      return ret
                    }
                  } else if (this.isDomainMode) {
                    const allOwnerDomain = this.list.selectedItems.every((item) => {
                      return item.domain_id === this.userInfo.projectDomainId
                    })
                    if (someStandard) {
                      ret.tooltip = this.$t('compute.text_649')
                      return ret
                    }
                    if (!allOwnerDomain) {
                      ret.tooltip = this.$t('compute.text_650')
                      return ret
                    }
                  } else {
                    const allOwnerProject = this.list.selectedItems.every((item) => {
                      return item.tenant_id === this.userInfo.projectId
                    })
                    if (someStandard) {
                      ret.tooltip = this.$t('compute.text_649')
                      return ret
                    }
                    if (!allOwnerProject) {
                      ret.tooltip = this.$t('compute.text_651')
                      return ret
                    }
                  }
                  if (someDisableDelete) {
                    ret.tooltip = this.$t('compute.text_652')
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
