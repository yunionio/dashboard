import { mapGetters } from 'vuex'
import * as R from 'ramda'
import { getSetPublicAction } from '@/utils/common/tableActions'
import i18n from '@/locales'

export default {
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo']),
  },
  created () {
    const validateAction = function (obj) {
      if (obj.is_guest_image === true || obj.is_guest_image === 'true') {
        return false
      }
      return true
    }

    const validateActionTooltip = function (obj) {
      if (obj.is_guest_image === true || obj.is_guest_image === 'true') {
        return i18n.t('compute.text_622')
      }
      return ''
    }

    const ownerDomain = obj => this.$store.getters.isAdminMode || obj.domain_id === this.$store.getters.userInfo.projectDomainId

    const isOwnerProject = project => project === this.$store.getters.userInfo.projectId || project === this.$store.getters.userInfo.projectName
    this.singleActions = [
      {
        label: i18n.t('compute.text_663'),
        action: obj => {
          this.createDialog('ImageCreateServerDialog', {
            data: [obj],
            columns: this.columns,
          })
        },
        meta: obj => {
          const ret = {
            validate: true,
            tooltip: '',
          }
          if (obj.status !== 'active') {
            ret.validate = false
            ret.tooltip = i18n.t('compute.text_681')
          }
          return ret
        },
      },
      {
        label: i18n.t('compute.text_352'),
        actions: obj => {
          return [
            {
              label: i18n.t('compute.text_247'),
              permission: 'images_update',
              action: obj => {
                this.createDialog('ImageEditAttributesDialog', {
                  data: [obj],
                  columns: this.columns,
                  refresh: this.refresh,
                  onManager: this.onManager,
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
                    validate: ownerDomain(obj),
                    tooltip: i18n.t('compute.text_682'),
                  }
                }
                return {
                  validate: isOwnerProject(obj.tenant_id),
                  tooltip: !isOwnerProject(obj.tenant_id) ? i18n.t('compute.text_623', [i18n.t('dictionary.domain')]) : '',
                }
              },
            },
            {
              label: i18n.t('compute.text_683'),
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
                    if (this.booleanTransfer(obj.is_standard)) {
                      ret.tooltip = i18n.t('compute.text_644')
                    }
                    return ret
                  }],
                  ['domain', () => {
                    ret.tooltip = i18n.t('compute.text_646')
                    return ret
                  }],
                  ['user', () => {
                    ret.tooltip = i18n.t('compute.text_646')
                    return ret
                  }],
                ])
                const action = actions.get(this.isAdminMode ? 'admin' : '') || actions.get(this.isDomainMode ? 'domain' : 'user')
                ret = action.call(this)
                if (ret.tooltip) return ret
                return { validate: true, tooltip: '' }
              },
            },
            {
              label: i18n.t('compute.text_684'),
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
                    if (!this.booleanTransfer(obj.is_standard)) {
                      ret.tooltip = i18n.t('compute.text_685')
                    }
                    return ret
                  }],
                  ['domain', () => {
                    ret.tooltip = i18n.t('compute.text_646')
                    return ret
                  }],
                  ['user', () => {
                    ret.tooltip = i18n.t('compute.text_646')
                    return ret
                  }],
                ])
                const action = actions.get(this.isAdminMode ? 'admin' : '') || actions.get(this.isDomainMode ? 'domain' : 'user')
                ret = action.call(this)
                if (ret.tooltip) return ret
                return { validate: true, tooltip: '' }
              },
            },
            getSetPublicAction(this, {
              name: this.$t('dictionary.image'),
              scope: 'project',
              resource: 'images',
              apiVersion: 'v1',
            }, {
              meta: () => {
                let ret = {
                  validate: false,
                  tooltip: '',
                }
                const actions = new Map([
                  ['admin', () => {
                    if (this.booleanTransfer(obj.is_standard)) {
                      ret.tooltip = i18n.t('compute.text_644')
                    }
                    return ret
                  }],
                  ['domain', () => {
                    if ((obj.shared_domains && obj.shared_domains.length > 0) || obj.public_scope === 'system') {
                      ret.tooltip = i18n.t('compute.text_686')
                      return ret
                    }
                    if (this.booleanTransfer(obj.is_standard)) {
                      ret.tooltip = i18n.t('compute.text_644')
                      return ret
                    }
                    return ret
                  }],
                  ['user', () => {
                    ret.tooltip = i18n.t('compute.text_613')
                    if (!this.booleanTransfer(obj.is_standard) && obj.public_scope === 'system') {
                      ret.tooltip = i18n.t('compute.text_646')
                      return ret
                    }
                    return ret
                  }],
                ])
                const action = actions.get(this.isAdminMode ? 'admin' : '') || actions.get(this.isDomainMode ? 'domain' : 'user')
                ret = action.call(this)
                if (ret.tooltip) return ret
                return { validate: true, tooltip: '' }
              },
            }),
            // {
            //   label: '设置共享',
            //   permission: 'images_perform_public',
            //   action: () => {
            //     this.createDialog('SetPublicDialog', {
            //       data: [obj],
            //       columns: this.columns,
            //       onManager: this.onManager,
            //     })
            //   },
            //   meta: () => {
            //     let ret = {
            //       validate: false,
            //       tooltip: '',
            //     }
            //     const actions = new Map([
            //       ['admin', () => {
            //         if (this.booleanTransfer(obj.is_standard)) {
            //           ret.tooltip = '公共镜像不支持该操作'
            //         }
            //         return ret
            //       }],
            //       ['domain', () => {
            //         if (this.booleanTransfer(obj.is_standard)) {
            //           ret.tooltip = '公共镜像不支持该操作'
            //           return ret
            //         }
            //         if (obj.public_scope === 'system') {
            //           ret.tooltip = '系统共享镜像不支持该操作'
            //           return ret
            //         }
            //         return ret
            //       }],
            //       ['user', () => {
            //         ret.tooltip = '只有管理员支持该操作'
            //         if (!this.booleanTransfer(obj.is_standard) && obj.public_scope === 'system') {
            //           ret.tooltip = '只有系统管理员支持该操作'
            //           return ret
            //         }
            //         return ret
            //       }],
            //     ])
            //     let action = actions.get(this.isAdminMode ? 'admin' : '') || actions.get(this.isDomainMode ? 'domain' : 'user')
            //     ret = action.call(this)
            //     if (ret.tooltip) return ret
            //     return { validate: true, tooltip: '' }
            //   },
            // },
            {
              label: this.$t('compute.text_279', [this.$t('dictionary.project')]),
              action: () => {
                this.createDialog('ChangeOwenrDialog', {
                  data: [obj],
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
                  ret.tooltip = i18n.t('compute.text_613')
                  return ret
                }
                if (obj.is_public === true || obj.is_public === 'true') {
                  ret.validate = false
                  ret.tooltip = i18n.t('compute.text_614')
                  return ret
                }
                return ret
              },
            },
            {
              label: i18n.t('compute.text_615'),
              permission: 'images_delete',
              action: (row) => {
                this.createDialog('ChangeDisableDelete', {
                  name: i18n.t('compute.text_97'),
                  columns: this.columns,
                  onManager: this.onManager,
                  data: [row],
                })
              },
              meta: () => {
                let ret = {
                  validate: false,
                  tooltip: '',
                }
                const actions = new Map([
                  ['admin', () => {
                    if (this.booleanTransfer(obj.is_standard)) {
                      ret.tooltip = i18n.t('compute.text_687')
                      return ret
                    }
                    return ret
                  }],
                  ['domain', () => {
                    if (this.booleanTransfer(obj.is_standard)) {
                      ret.tooltip = i18n.t('compute.text_688')
                      return ret
                    }
                    if (!ownerDomain(obj)) {
                      ret.tooltip = i18n.t('compute.text_689')
                      return ret
                    }
                    return ret
                  }],
                  ['user', () => {
                    if (this.booleanTransfer(obj.is_standard)) {
                      ret.tooltip = i18n.t('compute.text_688')
                      return ret
                    }
                    if (!isOwnerProject(obj.tenant_id)) {
                      ret.tooltip = i18n.t('compute.text_690')
                      return ret
                    }
                    return ret
                  }],
                ])
                const action = actions.get(this.isAdminMode ? 'admin' : '') || actions.get(this.isDomainMode ? 'domain' : 'user')
                ret = action.call(this)
                if (ret.tooltip) return ret
                return { validate: true, tooltip: '' }
              },
            },
            {
              label: i18n.t('compute.text_261'),
              permission: 'images_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: i18n.t('compute.text_261'),
                  name: this.$t('dictionary.image'),
                  onManager: this.onManager,
                })
              },
              meta: () => {
                let ret = {
                  validate: false,
                  tooltip: '',
                }
                const actions = new Map([
                  ['admin', () => {
                    if (this.booleanTransfer(obj.is_standard)) {
                      ret.tooltip = i18n.t('compute.text_648')
                      return ret
                    }
                    if (this.booleanTransfer(obj.disable_delete) && this.booleanTransfer(obj.protected)) {
                      ret.tooltip = i18n.t('compute.text_652')
                      return ret
                    }
                    return ret
                  }],
                  ['domain', () => {
                    if (this.booleanTransfer(obj.is_standard)) {
                      ret.tooltip = i18n.t('compute.text_649')
                      return ret
                    }
                    if (!ownerDomain(obj)) {
                      ret.tooltip = i18n.t('compute.text_650')
                      return ret
                    }
                    if (this.booleanTransfer(obj.disable_delete) && this.booleanTransfer(obj.protected)) {
                      ret.tooltip = i18n.t('compute.text_652')
                      return ret
                    }
                    return ret
                  }],
                  ['user', () => {
                    if (this.booleanTransfer(obj.is_standard)) {
                      ret.tooltip = i18n.t('compute.text_649')
                      return ret
                    }
                    if (!isOwnerProject(obj.tenant_id)) {
                      ret.tooltip = i18n.t('compute.text_651')
                      return ret
                    }
                    if (this.booleanTransfer(obj.disable_delete) && this.booleanTransfer(obj.protected)) {
                      ret.tooltip = i18n.t('compute.text_652')
                      return ret
                    }
                    return ret
                  }],
                ])
                const action = actions.get(this.isAdminMode ? 'admin' : '') || actions.get(this.isDomainMode ? 'domain' : 'user')
                ret = action.call(this)
                if (ret.tooltip) return ret
                return this.$getDeleteResult(obj)
              },
            },
          ]
        },
      },
    ]
  },
  methods: {
    updateStandard (isStandard, selectedItems) {
      const params = {
        is_standard: isStandard,
      }
      this.onManager('batchPerformAction', {
        id: selectedItems.map(item => item.id),
        managerArgs: {
          action: 'mark-standard',
          data: params,
        },
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
