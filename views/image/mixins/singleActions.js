import { mapGetters } from 'vuex'
import * as R from 'ramda'
import { getSetPublicAction } from '@/utils/common/tableActions'

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
        return '主机镜像的子镜像无法操作'
      }
      return ''
    }

    const ownerDomain = obj => this.$store.getters.isAdminMode || obj.domain_id === this.$store.getters.userInfo.projectDomainId

    const isOwnerProject = project => project === this.$store.getters.userInfo.projectId || project === this.$store.getters.userInfo.projectName
    this.singleActions = [
      {
        label: '新建虚拟机',
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
            ret.tooltip = '只有状态为可用的镜像才支持该操作'
          }
          return ret
        },
      },
      {
        label: '更多',
        actions: obj => {
          return [
            {
              label: '修改属性',
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
                    tooltip: '非当前域下面的镜像无法修改属性',
                  }
                }
                return {
                  validate: isOwnerProject(obj.tenant_id),
                  tooltip: !isOwnerProject(obj.tenant_id) ? `非当前${this.$t('dictionary.project')}下面的镜像无法修改属性` : '',
                }
              },
            },
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
                    if (this.booleanTransfer(obj.is_standard)) {
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
                const action = actions.get(this.isAdminMode ? 'admin' : '') || actions.get(this.isDomainMode ? 'domain' : 'user')
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
                    if (!this.booleanTransfer(obj.is_standard)) {
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
                      ret.tooltip = '公共镜像不支持该操作'
                    }
                    return ret
                  }],
                  ['domain', () => {
                    if ((obj.shared_domains && obj.shared_domains.length > 0) || obj.public_scope === 'system') {
                      ret.tooltip = '共享范围超出本域,不支持再设置共享'
                      return ret
                    }
                    if (this.booleanTransfer(obj.is_standard)) {
                      ret.tooltip = '公共镜像不支持该操作'
                      return ret
                    }
                    return ret
                  }],
                  ['user', () => {
                    ret.tooltip = '只有管理员支持该操作'
                    if (!this.booleanTransfer(obj.is_standard) && obj.public_scope === 'system') {
                      ret.tooltip = '只有系统管理员支持该操作'
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
              label: `更改${this.$t('dictionary.project')}`,
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
                  ret.tooltip = '只有管理员支持该操作'
                  return ret
                }
                if (obj.is_public) {
                  ret.validate = false
                  ret.tooltip = '只有不共享的镜像支持该操作'
                  return ret
                }
                return ret
              },
            },
            {
              label: '设置删除保护',
              permission: 'images_delete',
              action: (row) => {
                this.createDialog('ChangeDisableDelete', {
                  name: '系统镜像',
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
                      ret.tooltip = '公共镜像禁止设置删除保护，请切换为自定义镜像后重试'
                      return ret
                    }
                    return ret
                  }],
                  ['domain', () => {
                    if (this.booleanTransfer(obj.is_standard)) {
                      ret.tooltip = '公共镜像禁止设置删除保护'
                      return ret
                    }
                    if (!ownerDomain(obj)) {
                      ret.tooltip = '非当前域下的镜像无法设置删除保护'
                      return ret
                    }
                    return ret
                  }],
                  ['user', () => {
                    if (this.booleanTransfer(obj.is_standard)) {
                      ret.tooltip = '公共镜像禁止设置删除保护'
                      return ret
                    }
                    if (!isOwnerProject(obj.tenant_id)) {
                      ret.tooltip = '非当前项目下的镜像无法设置删除保护'
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
              label: '删除',
              permission: 'images_delete',
              action: () => {
                this.createDialog('DeleteResDialog', {
                  vm: this,
                  data: [obj],
                  columns: this.columns,
                  title: '删除',
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
                      ret.tooltip = '公共镜像禁止删除，请切换为自定义镜像后重试'
                      return ret
                    }
                    if (this.booleanTransfer(obj.disable_delete) && this.booleanTransfer(obj.protected)) {
                      ret.tooltip = '删除保护，如需解除，请点击【设置删除保护】'
                      return ret
                    }
                    return ret
                  }],
                  ['domain', () => {
                    if (this.booleanTransfer(obj.is_standard)) {
                      ret.tooltip = '公共镜像禁止删除'
                      return ret
                    }
                    if (!ownerDomain(obj)) {
                      ret.tooltip = '非当前域下的镜像无法删除'
                      return ret
                    }
                    if (this.booleanTransfer(obj.disable_delete) && this.booleanTransfer(obj.protected)) {
                      ret.tooltip = '删除保护，如需解除，请点击【设置删除保护】'
                      return ret
                    }
                    return ret
                  }],
                  ['user', () => {
                    if (this.booleanTransfer(obj.is_standard)) {
                      ret.tooltip = '公共镜像禁止删除'
                      return ret
                    }
                    if (!isOwnerProject(obj.tenant_id)) {
                      ret.tooltip = '非当前项目下的镜像无法删除'
                      return ret
                    }
                    if (this.booleanTransfer(obj.disable_delete) && this.booleanTransfer(obj.protected)) {
                      ret.tooltip = '删除保护，如需解除，请点击【设置删除保护】'
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
