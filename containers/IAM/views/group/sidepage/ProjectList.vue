<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions"
    default-search-key="projects" />
</template>

<script>
import * as R from 'ramda'
import {
  getNameDescriptionTableColumn,
  getProjectDomainTableColumn,
} from '@/utils/common/tableColumn'
import i18n from '@/locales'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'GroupProjectList',
  mixins: [WindowsMixin, ListMixin],
  props: {
    resId: String,
    id: String,
    getParams: {
      type: Object,
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
          projects: {
            label: i18n.t('dictionary.project'),
          },
        },
      }),
      // exportDataOptions: {
      //   items: [
      //     { label: 'ID', key: 'id' },
      //     { label: this.$t('table.title.name'), key: 'name' },
      //     { label: this.$t('dictionary.role'), key: 'roles' },
      //   ],
      // },
      columns: [
        {
          title: this.$t('common_389'),
          field: 'name',
          slots: {
            default: ({ row }) => {
              return [
                <list-body-cell-wrap copy row={row} onManager={this.onManager} field='name' title={row.name} message={row.name} hideField={true}>
                  <side-page-trigger permission='projects_get' name='ProjectSidePage' id={row.id} vm={this}>{ row.name }</side-page-trigger>
                </list-body-cell-wrap>,
              ]
            },
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
          label: this.$t('common_384'),
          action: () => {
            this.createDialog('GroupJoinProjectDialog', {
              data: [this.data],
              columns: [
                getNameDescriptionTableColumn({
                  onManager: this.onManager,
                  hideField: true,
                  slotCallback: row => {
                    return (
                      <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
                    )
                  },
                  formRules: [{
                    required: true,
                    message: i18n.t('system.text_168'),
                    whitespace: true,
                  }],
                }),
                getProjectDomainTableColumn(),
              ],
              success: () => {
                this.refresh()
                this.$bus.$emit('GroupUserListRefresh')
              },
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
          action: () => {
            this.createDialog('GroupLeaveProjectDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              resId: this.resId,
              success: () => {
                this.list.refresh()
              },
            })
          },
          meta: () => {
            return {
              validate: this.list.selectedItems.length >= 1,
            }
          },
        },
      ],
      singleActions: [
        {
          label: this.$t('common_490'),
          action: (obj) => {
            this.createDialog('GroupEditRolesDialog', {
              data: [obj],
              columns: this.columns,
              title: this.$t('common_490'),
              uid: this.data.id,
              refresh: this.refresh,
            })
          },
        },
        {
          label: this.$t('compute.text_950'),
          action: (obj) => {
            this.createDialog('GroupLeaveProjectDialog', {
              data: [obj],
              columns: this.columns,
              resId: this.resId,
              success: () => {
                this.list.refresh()
              },
            })
          },
        },
      ],
    }
  },
  created () {
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
          ...this.getParams,
          scope: this.$store.getters.scope,
          show_fail_reason: true,
          resource: 'group',
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
    getParam () {
      const ret = {
        ...this.getParams,
        details: true,
      }
      return ret
    },
  },
}
</script>
