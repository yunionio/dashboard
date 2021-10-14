<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :showPage="false"
    default-search-key="users" />
</template>

<script>
import * as R from 'ramda'
import {
  getNameDescriptionTableColumn,
  getProjectDomainTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ProjectDirectlyUnderUserList',
  mixins: [WindowsMixin],
  props: {
    resId: String,
    id: String,
    getParams: {
      type: Object,
    },
    onManager: {
      type: Function,
    },
    data: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: this.getList,
        getParams: this.getParam,
        idKey: '__index',
        filterOptions: {
          users: {
            label: i18n.t('system.text_101'),
          },
        },
      }),
      columns: [
        {
          title: this.$t('common.name'),
          field: 'name',
          slots: {
            default: ({ row }) => {
              if (row.groupId && row.groupName) {
                return [
                  <list-body-cell-wrap copy row={row} field='groupName' title={row.groupName} message={row.groupName} hideField={true}>
                    <side-page-trigger permission='groups_get' name='GroupSidePage' id={row.groupId} vm={this}>{ row.groupName }</side-page-trigger>
                  </list-body-cell-wrap>,
                ]
              }
              return [
                <list-body-cell-wrap copy row={row} field='name' title={row.name} message={row.name} hideField={true}>
                  <side-page-trigger permission='users_get' name='UserSidePage' id={row.id} vm={this}>{ row.name }</side-page-trigger>
                </list-body-cell-wrap>,
              ]
            },
          },
        },
        {
          field: 'type',
          title: this.$t('system.text_48'),
          formatter: ({ row, cellValue }) => {
            if (row.groupId && row.groupName) {
              return this.$t('dictionary.group')
            }
            return this.$t('dictionary.user')
          },
        },
        {
          field: 'roles',
          title: this.$t('dictionary.role'),
          formatter: ({ cellValue }) => {
            return cellValue.map(x => x.name).join(', ')
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
        {
          title: this.$t('table.title.owner_domain'),
          field: 'project_domain',
          slots: {
            default: ({ row }) => {
              return row.domain?.name || '-'
            },
          },
        },
      ],
      groupActions: [
        {
          label: this.$t('common_114'),
          action: () => {
            this.createDialog('ProjectAddUserOrGroupDialog', {
              data: [this.data],
              columns: [
                getNameDescriptionTableColumn({
                  onManager: this.onManager,
                  hideField: true,
                  formRules: [
                    { required: true, message: i18n.t('system.text_168') },
                  ],
                  slotCallback: row => {
                    return (
                      <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
                    )
                  },
                }),
                getProjectDomainTableColumn(),
              ],
              success: () => {
                this.list.refresh()
              },
            })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: this.$t('compute.text_950'),
          action: () => {
            this.createDialog('ProjectDeleteResDialog', {
              vm: this,
              title: this.$t('system.text_129'),
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
              projectId: this.resId,
              success: () => {
                this.list.refresh()
              },
            })
          },
          meta: () => {
            if (this.list.selectedItems.length <= 0) {
              return {
                validate: false,
              }
            }
            // if (this.list.selectedItems.some(item => { return item.groupId && item.groupName })) {
            //   return {
            //     validate: false,
            //   }
            // }
            return {
              validate: true,
            }
          },
        },
      ],
      singleActions: [
        {
          label: this.$t('common_490'),
          action: (obj) => {
            this.createDialog('ProjectEditRolesDialog', {
              data: [obj],
              columns: this.columns,
              title: this.$t('common_490'),
              uid: this.data.id,
              success: () => {
                this.list.refresh()
              },
            })
          },
          // meta: obj => ({
          //   validate: !(obj.groupId && obj.groupName),
          // }),
        },
        {
          label: this.$t('compute.text_950'),
          action: (obj) => {
            this.createDialog('ProjectDeleteResDialog', {
              vm: this,
              title: this.$t('system.text_129'),
              data: [obj],
              columns: this.columns,
              onManager: this.onManager,
              projectId: this.resId,
              success: () => {
                this.list.refresh()
              },
            })
          },
          // meta: obj => ({
          //   validate: !(obj.groupId && obj.groupName),
          // }),
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
    this.$bus.$on('ProjectDirectlyUnderUserListRefresh', () => {
      this.list.refresh()
    }, this)
  },
  methods: {
    async getList (params) {
      if (params.users) {
        params.users.map((item, index) => {
          params[`users.${index}`] = item
        })
        Reflect.deleteProperty(params, 'users')
      }
      const { data: { data } } = await new this.$Manager('role_assignments', 'v1').objectRpc({
        methodname: 'GetProjectRole',
        objId: this.data.id,
        params: {
          ...params,
          ...this.getParams,
          scope: this.$store.getters.scope,
          show_fail_reason: true,
          effective: true,
          resource: 'project',
          group_by: 'user',
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
      data.forEach((item) => {
        const { groups, domain } = item
        groups.forEach((group, index) => {
          const { id, name } = item
          const obj = {
            id,
            name,
            __index: id + index,
          }
          const { id: groupId, name: groupName, roles, policies } = group
          if (groupId && groupName) {
            obj.id = groupId
            obj.name = groupName
            obj.__index = obj.id + index
            obj.groupId = groupId
            obj.groupName = groupName
          }
          obj.roles = roles
          obj.policies = policies
          obj.domain = domain
          arr.push(obj)
        })
      })

      for (let i = 0; i < arr.length; i++) {
        for (let j = i + 1; j < arr.length; j++) {
          if (arr[i].groupId && arr[i].groupId === arr[j].groupId) {
            arr.splice(j, 1)
            j--
          }
        }
      }
      const ret = {
        data: {
          data: arr,
          total: arr.length,
        },
      }
      return ret
    },
    getParam () {
      const ret = {
        ...this.getParams,
        resource: 'project',
      }
      return ret
    },
  },
}
</script>
