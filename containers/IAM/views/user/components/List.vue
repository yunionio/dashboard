<template>
  <page-list
    show-tag-filter
    show-tag-columns
    show-ext-tags
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions"
    :export-data-options="exportDataOptions"
    :ext-tag-params="{ service: 'identity' }" />
</template>

<script>
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import { getEnabledFilter, getProjectDomainFilter, getDescriptionFilter, getCreatedAtFilter } from '@/utils/common/tableFilter'
import { Manager } from '@/utils/manager'
import store from '@/store'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import GlobalSearchMixin from '@/mixins/globalSearch'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

const genProjectGroupData = (data) => {
  const projectList = []
  const groupList = []
  data.forEach((item) => {
    const { groups } = item
    groups.forEach((group, index) => {
      const { name } = item
      const { id: groupId, name: groupName } = group
      if (groupId && groupName) {
        groupList.push(groupName)
      } else {
        projectList.push(name)
      }
    })
  })
  return { groupList, projectList }
}

export default {
  name: 'UserList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
    },
    isAllowCreate: {
      type: Boolean,
      default: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'users',
        apiVersion: 'v1',
        getParams: this.getParam,
        sortKeys: ['name', 'project_domain'],
        filterOptions: {
          id: {
            label: this.$t('table.title.id'),
          },
          name: {
            label: this.$t('system.text_101'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          description: getDescriptionFilter(),
          displayname: {
            label: this.$t('scope.text_245'),
            filter: true,
            formatter: val => {
              return `displayname.contains("${val}")`
            },
          },
          enabled: getEnabledFilter(),
          allow_web_console: {
            label: this.$t('system.text_475'),
            dropdown: true,
            items: [
              { label: this.$t('system.text_476'), key: true },
              { label: this.$t('system.text_477'), key: false },
            ],
          },
          project_domain: getProjectDomainFilter(),
          created_at: getCreatedAtFilter(),
          idp_id: {
            label: this.$t('dictionary.identity_provider'),
          },
        },
        responseData: this.responseData,
        hiddenColumns: ['created_at'],
      }),
      userTotal: 0,
    }
  },
  computed: {
    groupActions () {
      const actions = [
        {
          label: this.$t('system.text_128'),
          permission: 'users_create',
          action: () => {
            this.$router.push('/systemuser/create')
          },
          meta: () => {
            const ret = {
              buttonType: 'primary',
            }
            return ret
          },
        },
        {
          label: this.$t('system.text_478'),
          permission: 'users_create',
          action: () => {
            this.createDialog('UserImprotDialog', {
              onManager: this.onManager,
              refresh: this.refresh,
            })
          },
        },
        {
          label: this.$t('system.text_166'),
          actions: () => {
            return [
              {
                label: this.$t('system.text_479'),
                permission: 'users_update',
                action: () => {
                  this.createDialog('UserUpdateDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                  })
                },
              },
              ...getEnabledSwitchActions(this, undefined, ['users_perform_enable', 'users_perform_disable'], {
                actions: [
                  () => {
                    this.onManager('batchPerformAction', {
                      ids: this.list.selectedItems.map(({ id }) => id),
                      managerArgs: {
                        action: 'enable',
                      },
                    })
                  },
                  () => {
                    this.onManager('batchPerformAction', {
                      ids: this.list.selectedItems.map(({ id }) => id),
                      managerArgs: {
                        action: 'disable',
                      },
                    })
                  },
                ],
              }),
              {
                label: this.$t('system.text_129'),
                permission: 'users_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('system.text_480'),
                    name: this.$t('dictionary.user'),
                    onManager: this.onManager,
                  })
                },
                meta: () => {
                  return {
                    validate: this.list.allowDelete(),
                  }
                },
              },
            ]
          },
          meta: () => ({
            validate: !!this.list.selectedItems.length,
          }),
        },
      ]
      if (!this.isAllowCreate) {
        actions.shift()
        actions.shift()
      }
      return actions
    },
    exportDataOptions () {
      const ret = {
        downloadType: 'local',
        title: this.$t('dictionary.user'),
        items: [
          { key: 'id', label: 'ID' },
          ...this.columns,
          {
            key: 'projects',
            label: this.$t('common_494'),
          },
          {
            key: 'groups',
            label: this.$t('common_495'),
          },
        ],
        async callback (data, selectedExportKeys) {
          if (!selectedExportKeys.includes('groups') && !selectedExportKeys.includes('groups')) {
            return data
          }

          const manager = new Manager('role_assignments', 'v1')
          const allPromise = data.map(async item => {
            let projectStr = ''
            let groupStr = ''

            try {
              const { data: { data } } = await manager.objectRpc({
                methodname: 'GetProjectRole',
                objId: item.id,
                params: {
                  scope: store.getters.scope,
                  show_fail_reason: true,
                  effective: true,
                  resource: 'user',
                  group_by: 'project',
                },
              })
              console.log(data)
              const { projectList, groupList } = genProjectGroupData(data)
              projectStr = projectList.join(',')
              groupStr = groupList.join(',')
            } catch (error) {
              console.log(`user: ${item.id}, project info fetch error!!!`)
              throw error
            }
            return Promise.resolve({ id: item.id, projects: projectStr, groups: groupStr })
          })

          const results = Promise.all(allPromise).then(values => {
            console.log('values', values)
            const realData = data.map(item => {
              const curObj = values.find(v => v.id === item.id)
              return {
                ...item,
                projects: curObj.projects,
                groups: curObj.groups,
              }
            })
            return realData
          })
          return results
        },
      }
      return ret
    },
  },
  created () {
    this.initSidePageTab('user-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...this.getParams,
        details: true,
      }
      return ret
    },
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'UserSidePage', {
        id: row.id,
        resource: 'users',
        apiVersion: 'v1',
        getParams: this.getParam,
      }, {
        list: this.list,
        tab,
      })
    },
  },
}
</script>
