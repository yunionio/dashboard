<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    default-search-key="projects" />
</template>

<script>
import * as R from 'ramda'
import {
  getNameDescriptionTableColumn,
  getEnabledTableColumn,
  getProjectDomainTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'UserSidepageProjects',
  mixins: [WindowsMixin, ListMixin],
  props: {
    id: String,
    data: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: this.getList,
        getParams: { effective: true, resource: 'user' },
        idKey: '__index',
        filterOptions: {
          projects: {
            label: i18n.t('dictionary.project'),
          },
        },
      }),
      columns: [
        {
          title: this.$t('common_389'),
          field: 'name',
          slots: {
            default: ({ row }) => {
              return [
                <list-body-cell-wrap copy row={row} field='name' title={row.name} message={row.name} hideField={true}>
                  <side-page-trigger permission='projects_get' name='ProjectSidePage' id={row.id} vm={this}>{ row.name }</side-page-trigger>
                </list-body-cell-wrap>,
              ]
            },
          },
        },
        {
          title: this.$t('table.title.owner_domain'),
          field: 'project_domain',
          slots: {
            default: ({ row }) => {
              return row.domain?.name || '-'
            },
          },
        },
        {
          title: this.$t('system.text_48'),
          field: 'type',
          slots: {
            default: ({ row }) => {
              if (row.groupId && row.groupName) {
                return this.$t('common_558')
              }
              return this.$t('common_559')
            },
          },
        },
        {
          title: this.$t('system.text_7'),
          field: 'groupName',
          slots: {
            default: ({ row }) => {
              if (!row.groupName) return '-'
              return [
                <list-body-cell-wrap copy row={row} field='groupName' title={row.groupName} message={row.groupName} hideField={true}>
                  <side-page-trigger permission='groups_get' name='GroupSidePage' id={row.groupId} vm={this}>{ row.groupName }</side-page-trigger>
                </list-body-cell-wrap>,
              ]
            },
          },
        },
        {
          title: this.$t('dictionary.role'),
          field: 'role',
          slots: {
            default: ({ row }) => {
              return row.roles.map(item => item.name).join(', ')
            },
          },
        },
        {
          title: this.$t('dictionary.policy'),
          field: 'role',
          slots: {
            default: ({ row }) => {
              if (R.isNil(row.policies) || R.isEmpty(row.policies)) return '-'
              Object.values(row.policies).flat(Infinity).join(', ')
              const policies = Object.values(row.policies).flat(Infinity)
              const ret = policies.map((item, idx) => {
                return (
                  <div style="display: inline-block;">
                    <side-page-trigger permission='policies_get' name='PolicySidePage' id={item} vm={this}>{ item }</side-page-trigger>
                    { idx !== policies.length - 1 ? '、' : '' }
                  </div>
                )
              })
              return ret
            },
          },
        },
      ],
      groupActions: [
        {
          label: this.$t('common_384'),
          permission: 'users_perform_join',
          action: () => {
            this.createDialog('UserProjectJoinDialog', {
              data: [this.data],
              columns: [
                getNameDescriptionTableColumn({
                  hideField: true,
                  formRules: [
                    { required: true, message: i18n.t('system.text_168') },
                  ],
                  edit: row => row.idp_driver !== 'ldap',
                  slotCallback: row => {
                    return (
                      <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
                    )
                  },
                }),
                getProjectDomainTableColumn(),
                getEnabledTableColumn(),
              ],
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('compute.text_950'),
          permission: 'users_perform_leave',
          action: () => {
            this.createDialog('UserProjectLeaveDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('system.text_200', [this.$t('dictionary.project')]),
              uid: this.data.id,
              refresh: this.refresh,
            })
          },
          meta: () => {
            const validate = this.list.selectedItems && this.list.selectedItems.length > 0 && this.list.selectedItems.filter(item => { return item.groupName }).length === 0
            let tooltip = ''
            const hasCurrentProject = this.list.selectedItems.some(item => {
              return item.id === this.$store.getters.userInfo.projectId && this.data.name === this.$store.getters.userInfo.name
            })
            if (hasCurrentProject) {
              tooltip = this.$t('system.text_527')
            } else if (this.list.selectedItems.filter(item => { return item.groupName }).length > 0) {
              tooltip = this.$t('common_561')
            }
            return {
              validate: validate && !hasCurrentProject,
              tooltip: tooltip,
            }
          },
        },
      ],
      singleActions: [
        {
          label: this.$t('common_490'),
          permission: 'users_perform_join',
          action: (obj) => {
            this.createDialog('UserEditRolesDialog', {
              data: [obj],
              columns: this.columns,
              title: this.$t('common_490'),
              uid: this.data.id,
              refresh: this.refresh,
            })
          },
          meta: (obj) => {
            const isGroup = obj.groupId && obj.groupName
            if (isGroup) {
              return {
                validate: false,
                tooltip: this.$t('common_560'),
              }
            }
            return {
              validate: true,
            }
          },
        },
        {
          label: this.$t('compute.text_950'),
          permission: 'users_perform_leave',
          action: (obj) => {
            this.createDialog('UserProjectLeaveDialog', {
              data: [obj],
              columns: this.columns,
              title: this.$t('system.text_200', [this.$t('dictionary.project')]),
              uid: this.data.id,
              refresh: this.refresh,
            })
          },
          meta: (obj) => {
            const isGroup = obj.groupId && obj.groupName
            if (isGroup) {
              return {
                validate: false,
                tooltip: this.$t('common_561'),
              }
            }
            const isCurrentProject = obj.id === this.$store.getters.userInfo.projectId && this.data.name === this.$store.getters.userInfo.name
            return {
              validate: !isCurrentProject,
              tooltip: isCurrentProject ? this.$t('system.text_527') : '',
            }
          },
        },
      ],
    }
  },
  created () {
    this.$bus.$on('UserSidepageProjectsListRefresh', () => {
      this.list.refresh()
    }, this)
    this.list.fetchData()
  },
  methods: {
    async getList (params) {
      if (params.projects) {
        params.projects.map((item, index) => {
          params[`projects.${index}`] = item
        })
        Reflect.deleteProperty(params, 'projects')
      }
      const { data: { data } } = await new this.$Manager('role_assignments', 'v1').objectRpc({
        methodname: 'GetProjectRole',
        objId: this.data.id,
        params: {
          ...params,
          scope: this.$store.getters.scope,
          show_fail_reason: true,
          effective: true,
          resource: 'user',
          group_by: 'project',
          limit: 20,
        },
      })
      return new Promise((resolve, reject) => {
        const ret = this.genResourceData(data)
        resolve(ret)
      })
    },
    genResourceData (data) {
      const arr = []
      data.map((item) => {
        const { groups, domain } = item
        groups.map((group, index) => {
          const { id, name } = item
          const obj = {
            id,
            name,
            __index: id + index,
          }
          const { id: groupId, name: groupName, roles, policies } = group
          if (groupId && groupName) {
            obj.groupId = groupId
            obj.groupName = groupName
          }
          obj.roles = roles
          obj.policies = policies
          obj.domain = domain
          arr.push(obj)
        })
      })
      const ret = {
        data: {
          data: arr,
          total: arr.length,
        },
      }
      return ret
    },
    // genMergeCells (data) {
    //   const _res = []
    //   for (let i = 0; i < data.length;) {
    //     let count = 0
    //     for (let j = i; j < data.length; j++) {
    //       if (data[i].id === data[j].id) {
    //         count++
    //       }
    //     }
    //     if (count > 1) {
    //       _res.push({
    //         row: i,
    //         col: 1,
    //         rowspan: count,
    //         colspan: 1,
    //       })
    //     }
    //     i += count
    //   }
    //   return _res
    // },
    // // 通用单元格合并函数（将指定区域进行合并）
    // mergeMethod ({ rowIndex, columnIndex, data }) {
    //   const mergeCells = this.genMergeCells(data)
    //   for (let mIndex = 0; mIndex < mergeCells.length; mIndex++) {
    //     const { row, col, rowspan, colspan } = mergeCells[mIndex]
    //     if (row === rowIndex && col === columnIndex) {
    //       return { rowspan, colspan }
    //     }
    //     if (rowIndex >= row && rowIndex < row + rowspan && columnIndex >= col && columnIndex < col + colspan) {
    //       return { rowspan: 0, colspan: 0 }
    //     }
    //   }
    //   return { rowspan: 1, colspan: 1 }
    // },
  },
}
</script>
