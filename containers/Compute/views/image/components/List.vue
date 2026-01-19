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
    :before-show-menu="beforeShowMenu"
    :show-page="!isTemplate" />
</template>

<script>
import { mapGetters } from 'vuex'
import * as R from 'ramda'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import ResTemplateListMixin from '@/mixins/resTemplateList'
import GlobalSearchMixin from '@/mixins/globalSearch'
import {
  getNameFilter,
  getTenantFilter,
  getDomainFilter,
  getOsArchFilter,
  getImageDistributionFilter,
  getDescriptionFilter,
  getStatusFilter,
} from '@/utils/common/tableFilter'
import { getSetPublicAction } from '@/utils/common/tableActions'
import { isCE } from '@/utils/utils'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'

export default {
  name: 'ImageList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin, ResTemplateListMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
    cloudEnv: String,
    diskFormats: {
      type: Array,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'images',
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
          status: getStatusFilter('image'),
          description: getDescriptionFilter(),
          distributions: getImageDistributionFilter(),
          disk_formats: {
            label: this.$t('table.title.disk_format'),
            dropdown: true,
            multiple: true,
            distinctField: {
              type: 'field',
              key: 'disk_format',
            },
          },
          is_standard: {
            label: this.$t('table.title.image_type'),
            dropdown: true,
            items: [
              { label: this.$t('compute.text_620'), key: true },
              { label: this.$t('compute.text_621'), key: false },
            ],
          },
          projects: getTenantFilter(),
          project_domains: getDomainFilter(),
          os_arch: getOsArchFilter(),
        },
        responseData: this.responseData,
        hiddenColumns: ['metadata', 'created_at', 'os_arch'],
      }),
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo']),
    groupActions () {
      const ownerDomain = obj => this.$store.getters.isAdminMode || obj.domain_id === this.$store.getters.userInfo.projectDomainId
      const isOwnerProject = project => project === this.$store.getters.userInfo.projectId || project === this.$store.getters.userInfo.projectName

      const ImageImport = {
        label: this.$t('compute.text_642'),
        permission: 'images_create',
        action: () => {
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.$router.push({ name: 'ImageImport' })
        },
        hidden: () => this.$isScopedPolicyMenuHidden('image_hidden_menus.image_store'),
      }

      const ImageImportCe = {
        label: this.$t('compute.open_image_market'),
        permission: 'images_create',
        action: () => {
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.$router.push({ name: 'ImageImportCe' })
        },
        hidden: () => this.$isScopedPolicyMenuHidden('image_hidden_menus.image_store'),
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
        meta: () => ({
          buttonType: 'primary',
        }),
        hidden: () => this.$isScopedPolicyMenuHidden('image_hidden_menus.image_upload'),
      }
      const batchActions = [
        {
          label: this.$t('compute.text_275'),
          actions: obj => {
            return [
              getSetPublicAction(this, {
                name: this.$t('dictionary.image'),
                scope: 'project',
                resource: 'images',
                apiVersion: 'v1',
              }, {
                permission: 'images_perform_public,images_perform_private',
                meta: () => {
                  let ret = {
                    validate: false,
                    tooltip: '',
                  }
                  const actions = new Map([
                    ['admin', () => {
                      if (this.list.selectedItems.some(item => this.booleanTransfer(item.is_standard))) {
                        ret.tooltip = this.$t('compute.text_644')
                      }
                      return ret
                    }],
                    ['domain', () => {
                      if (this.list.selectedItems.some(item => this.booleanTransfer(item.is_standard))) {
                        ret.tooltip = this.$t('compute.text_644')
                        return ret
                      }
                      if (this.list.selectedItems.some(item => item.public_scope === 'system')) {
                        ret.tooltip = this.$t('compute.text_645')
                        return ret
                      }
                      return ret
                    }],
                    ['user', () => {
                      ret.tooltip = this.$t('compute.text_613')
                      if (this.list.selectedItems.some(item => !this.booleanTransfer(item.is_standard) && item.public_scope === 'system')) {
                        ret.tooltip = this.$t('compute.text_646')
                        return ret
                      }
                      return ret
                    }],
                  ])
                  const action = actions.get(this.isAdminMode ? 'admin' : '') || actions.get(this.isDomainMode ? 'domain' : 'user')
                  ret = action.call(this)
                  if (ret.tooltip) return ret
                  return { validate: true }
                },
              }),
              {
                label: this.$t('compute.perform_change_owner', [this.$t('dictionary.project')]),
                permission: 'images_perform_change_owner',
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
                hidden: () => this.$isScopedPolicyMenuHidden('image_hidden_menus.image_change_project'),
              },
              {
                label: this.$t('table.action.set_tag'),
                permission: 'images_perform_set_user_metadata',
                action: () => {
                  this.createDialog('SetTagDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    mode: 'add',
                    params: {
                      resources: 'image',
                    },
                    tipName: this.$t('compute.text_97'),
                  })
                },
              },
              {
                label: this.$t('compute.image.merge_mirror'),
                action: () => {
                  this.createDialog('MergeMirrorDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                    refresh: this.refresh,
                  })
                },
                meta: () => {
                  const ret = { validate: true }
                  if (this.list.selectedItems.length < 2) {
                    ret.validate = false
                    ret.tooltip = this.$t('compute.image.merge_mirror.action.tooltip')
                    return ret
                  }
                  const isSomeISO = this.list.selectedItems.some(item => item.disk_format === 'iso')
                  if (isSomeISO) {
                    ret.validate = false
                    ret.tooltip = this.$t('compute.image.merge_mirror.system_image.select_validate')
                    return ret
                  }
                  return ret
                },
              },
              {
                label: this.$t('common_277'),
                permission: 'images_update',
                action: (row) => {
                  this.createDialog('ChangeDisableDelete', {
                    name: this.$t('compute.text_97'),
                    columns: this.columns,
                    onManager: this.onManager,
                    data: this.list.selectedItems,
                  })
                },
                meta: () => {
                  let ret = {
                    validate: false,
                    tooltip: '',
                  }
                  for (const obj of this.list.selectedItems) {
                    const actions = new Map([
                      ['admin', () => {
                        if (this.booleanTransfer(obj.is_standard)) {
                          ret.tooltip = this.$t('compute.text_687')
                          return ret
                        }
                        return ret
                      }],
                      ['domain', () => {
                        if (this.booleanTransfer(obj.is_standard)) {
                          ret.tooltip = this.$t('compute.text_688')
                          return ret
                        }
                        if (!ownerDomain(obj)) {
                          ret.tooltip = this.$t('compute.text_689')
                          return ret
                        }
                        return ret
                      }],
                      ['user', () => {
                        if (this.booleanTransfer(obj.is_standard)) {
                          ret.tooltip = this.$t('compute.text_688')
                          return ret
                        }
                        if (!isOwnerProject(obj.tenant_id)) {
                          ret.tooltip = this.$t('compute.text_690')
                          return ret
                        }
                        return ret
                      }],
                    ])
                    const action = actions.get(this.isAdminMode ? 'admin' : '') || actions.get(this.isDomainMode ? 'domain' : 'user')
                    ret = action.call(this)
                    if (ret.tooltip) {
                      break
                    }
                  }
                  if (ret.tooltip) return ret
                  return { validate: true, tooltip: '' }
                },
                hidden: () => this.$isScopedPolicyMenuHidden('image_hidden_menus.image_set_delete_protection'),
              },
              {
                label: this.$t('compute.perform_delete'),
                permission: 'images_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    alert: this.$t('compute.text_1393'),
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
                    ret.tooltip = this.$t('common.text00008')
                    return ret
                  }
                  return this.$getDeleteResult(this.list.selectedItems)
                },
                hidden: () => this.$isScopedPolicyMenuHidden('image_hidden_menus.image_delete'),
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
      // if (this.isAdminMode) {
      batchActions.unshift(ImageImportCe)
      // }
      if (this.isAdminMode && !isCE() && !this.$store.getters.isSysCE) {
        batchActions.unshift(ImageImport)
      }
      batchActions.unshift(ImageUpload)
      return batchActions
    },
    exportDataOptions () {
      return {
        downloadType: 'local',
        title: this.$t('compute.text_97'),
        items: this.columns,
        hiddenFields: ['os_type'],
        fixedItems: [
          { key: 'properties.os_distribution', label: this.$t('table.title.os') },
          { key: 'size', label: this.$t('table.title.image_size') + '(B)' },
          { key: 'is_standard', label: this.$t('compute.text_620') },
        ],
      }
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
        ...this.getParams,
      }
      // if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      if (this.diskFormats) {
        if (!ret.disk_formats) {
          ret.disk_formats = []
        }
        for (let i = 0; i < this.diskFormats.length; i++) {
          ret.disk_formats.push(this.diskFormats[i])
        }
      }
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
    beforeShowMenu () {
      return this.$store.dispatch('scopedPolicy/get', {
        category: ['image_hidden_menus'],
      })
    },
  },
}
</script>
