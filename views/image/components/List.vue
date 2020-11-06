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
    :showGroupActions="showGroupActions"
    :before-show-menu="beforeShowMenu" />
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
import { getNameFilter, getTenantFilter, getDomainFilter } from '@/utils/common/tableFilter'

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
          name: getNameFilter(),
          disk_formats: {
            label: this.$t('table.title.disk_format'),
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
            label: this.$t('table.title.image_type'),
            dropdown: true,
            items: [
              { label: this.$t('compute.text_620'), key: true },
              { label: this.$t('compute.text_621'), key: false },
            ],
          },
          projects: getTenantFilter(),
          project_domains: getDomainFilter(),
        },
        responseData: this.responseData,
        hiddenColumns: ['metadata', 'created_at'],
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('table.title.name'), key: 'name' },
          { label: this.$t('table.title.disk_format'), key: 'disk_format' },
          { label: this.$t('table.title.image_size'), key: 'size' },
          { label: this.$t('res.project'), key: 'tenant' },
          { label: this.$t('table.title.image_type'), key: 'is_standard' },
          { label: this.$t('table.title.create_time'), key: 'created_at' },
          { label: this.$t('table.title.checksum'), key: 'checksum' },
          { label: this.$t('table.title.user_tag'), key: 'user_tags' },
        ],
      },
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
        meta: () => ({
          buttonType: 'primary',
        }),
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
        hidden: () => this.$isScopedPolicyMenuHidden('image_hidden_menus.image_upload'),
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
                hidden: () => this.$isScopedPolicyMenuHidden('image_hidden_menus.image_change_project'),
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
                label: this.$t('table.action.set_tag'),
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
    beforeShowMenu () {
      return this.$store.dispatch('scopedPolicy/get', {
        category: ['image_hidden_menus'],
      })
    },
  },
}
</script>
