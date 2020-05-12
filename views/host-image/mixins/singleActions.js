import { mapGetters } from 'vuex'
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
        label: '修改属性',
        permission: 'images_update',
        action: obj => {
          this.createDialog('ImageEditAttributesDialog', {
            data: [obj],
            columns: this.columns,
            refresh: this.refresh,
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
              tooltip: `非当前${this.$t('dictionary.domain')}下面的镜像无法修改属性`,
            }
          }
          return {
            validate: isOwnerProject(obj.tenant_id),
            tooltip: !isOwnerProject(obj.tenant_id) ? `非当前${this.$t('dictionary.project')}下面的镜像无法修改属性` : '',
          }
        },
      },
      {
        label: '更多',
        actions: obj => {
          return [
            getSetPublicAction(this, {
              name: this.$t('dictionary.guestimage'),
              scope: 'project',
            }, {
              permission: 'images_perform_public',
              meta: () => {
                function validate (val, tooltip = validateActionTooltip(obj)) {
                  return {
                    validate: val,
                    tooltip,
                  }
                }
                if (obj.is_standard) validate(false, '公共镜像不支持设置')
                if (!validateAction(obj)) validate(false)
                // 1、管理后台视图可以对所有镜像进行操作；
                // 2、域管理后台视图只能对该域下的镜像进行操作，不能对其他域共享的镜像进行操作；
                // 3、项目视图只能对该项目下的镜像进行操作，不能对其他域、其他项目共享的镜像进行操作。
                if (this.isAdminMode) validate(true)
                if (!this.isAdminMode && !this.isDomainAdmin) validate(this.userInfo.projectId === obj.tenant_id)
                if (this.isDomainMode) validate(this.userInfo.projectDomainId === obj.domain_id)
                return {
                  validate: true,
                }
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
            //       refresh: this.refresh,
            //     })
            //   },
            //   meta: () => {
            //     function validate (val, tooltip = validateActionTooltip(obj)) {
            //       return {
            //         validate: val,
            //         tooltip,
            //       }
            //     }
            //     if (obj.is_standard) validate(false, '公共镜像不支持设置')
            //     if (!validateAction(obj)) validate(false)
            //     // 1、管理后台视图可以对所有镜像进行操作；
            //     // 2、域管理后台视图只能对该域下的镜像进行操作，不能对其他域共享的镜像进行操作；
            //     // 3、项目视图只能对该项目下的镜像进行操作，不能对其他域、其他项目共享的镜像进行操作。
            //     if (this.isAdminMode) validate(true)
            //     if (!this.isAdminMode && !this.isDomainAdmin) validate(this.userInfo.projectId === obj.tenant_id)
            //     if (this.isDomainMode) validate(this.userInfo.projectDomainId === obj.domain_id)
            //     return {
            //       validate: true,
            //     }
            //   },
            // },
            {
              label: `更改${this.$t('dictionary.project')}`,
              action: () => {
                this.createDialog('ChangeOwenrDialog', {
                  data: [obj],
                  columns: this.columns,
                  onManager: this.onManager,
                  name: this.$t('dictionary.guestimage'),
                })
              },
              meta: () => {
                let ret = {
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
              action: (row) => {
                this.createDialog('ChangeDisableDelete', {
                  name: this.$t('dictionary.guestimage'),
                  columns: this.columns,
                  onManager: this.onManager,
                  data: [row],
                })
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
                  name: this.$t('dictionary.guestimage'),
                  onManager: this.onManager,
                  requestData: {
                    override_pending_delete: true,
                  },
                })
              },
              meta: () => {
                if (this.isDomainAdmin && obj.domain_id !== this.userInfo.projectDomainId) {
                  return {
                    validate: false,
                    tooltip: `${this.$t('dictionary.domain')}管理员只能删除本${this.$t('dictionary.domain')}下的镜像`,
                  }
                }
                if (!validateAction(obj)) return { validate: false, tooltip: validateActionTooltip(obj) }
                return this.$getDeleteResult(obj)
              },
            },
          ]
        },
      },
    ]
  },
}
