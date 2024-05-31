<template>
  <page-list
    show-tag-columns
    show-tag-filter
    show-tag-config
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions"
    :showSingleActions="showSingleActions"
    :export-data-options="exportDataOptions"
    :tag-config-params="tagConfigParams"
    :ext-tag-params="{ service: 'identity' }" />
</template>

<script>
import { mapGetters } from 'vuex'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import { Manager } from '@/utils/manager'
import store from '@/store'
import { getProjectDomainFilter, getDescriptionFilter, getCreatedAtFilter, getDistinctFieldFilter } from '@/utils/common/tableFilter'
import GlobalSearchMixin from '@/mixins/globalSearch'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

const genUserProjectData = (data) => {
  const userList = []
  const groupList = []
  data.forEach((item) => {
    const { groups } = item
    groups.forEach((group, index) => {
      const { name } = item
      const { id: groupId, name: groupName } = group
      if (groupId && groupName) {
        groupList.push(groupName)
      } else {
        userList.push(name)
      }
    })
  })
  return { groupList, userList }
}

export default {
  name: 'ProjectList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
    isAllowCreate: {
      type: Boolean,
      default: true,
    },
    showSingleActions: {
      type: Boolean,
      default: true,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        getParams: this.getParams,
        resource: 'projects',
        apiVersion: 'v1',
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
          project_domain: getProjectDomainFilter(),
          created_at: getCreatedAtFilter(),
          user_id: {
            label: this.$t('dictionary.user'),
          },
          admin_id: getDistinctFieldFilter({ label: this.$t('iam.project_admin'), field: 'admin', type: 'extra_field' }),
          group_id: {
            label: this.$t('dictionary.group'),
          },
          idp_id: {
            label: this.$t('dictionary.identity_provider'),
          },
        },
        responseData: this.responseData,
        hiddenColumns: ['created_at'],
      }),
      tagConfigParams: {
        id: this.id,
        title: this.$t('common.text00124'),
        resource: 'projects',
        queryTreeId: 'tag-value-tree',
        tagFilterKey: 'tags',
      },
    }
  },
  computed: {
    ...mapGetters(['globalConfig']),
    groupActions () {
      const actions = [
        {
          label: this.$t('system.text_128'),
          permission: 'projects_create',
          action: () => {
            this.$router.push('/project/create')
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('table.action.set_tag'),
          permission: 'projects_perform_set_user_metadata',
          action: () => {
            this.createDialog('SetTagDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
              params: {
                resource: 'projects',
                with_cloud_meta: false,
                service: 'identity',
              },
              managerInstance: new this.$Manager('metadatas/tag-value-pairs', 'v2'),
              mode: 'add',
            })
          },
          meta: () => {
            return {
              validate: this.list.selectedItems.length > 0,
            }
          },
        },
        {
          label: this.$t('iam.set_project_admin'),
          permission: 'projects_perform_set_admin',
          action: () => {
            this.createDialog('ProjectSetAdminDialog', {
              vm: this,
              title: this.$t('iam.set_project_admin'),
              name: this.$t('system.text_9'),
              data: this.list.selectedItems,
              columns: this.columns,
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              validate: this.list.selectedItems.length > 0,
            }
          },
        },
        {
          label: this.$t('system.text_129'),
          permission: 'projects_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              title: this.$t('system.text_129'),
              name: this.$t('dictionary.project'),
              data: this.list.selectedItems,
              columns: this.columns,
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
      if (!this.isAllowCreate) actions.shift()
      return actions
    },
    exportDataOptions () {
      const ret = {
        downloadType: 'local',
        title: this.$t('dictionary.project'),
        items: [
          { label: 'ID', key: 'id' },
          ...this.columns,
          {
            key: 'users',
            label: this.$t('iam.joined_user'),
          },
          {
            key: 'groups',
            label: this.$t('common_495'),
          },
        ],
        async callback (data, selectedExportKeys) {
          if (!selectedExportKeys.includes('users') && !selectedExportKeys.includes('groups')) {
            return data
          }

          const manager = new Manager('role_assignments', 'v1')
          const allPromise = data.map(async item => {
            let groupStr = ''
            let userStr = ''

            try {
              const { data: { data } } = await manager.objectRpc({
                methodname: 'GetProjectRole',
                objId: item.id,
                params: {
                  scope: store.getters.scope,
                  show_fail_reason: true,
                  effective: true,
                  resource: 'project',
                  group_by: 'user',
                },
              })
              const { userList, groupList } = genUserProjectData(data)
              groupStr = groupList.join(',')
              userStr = userList.join(',')
            } catch (error) {
              console.log(`project: ${item.id}, user info fetch error!!!`)
              throw error
            }
            return Promise.resolve({ id: item.id, groups: groupStr, users: userStr })
          })

          const results = Promise.all(allPromise).then(values => {
            const realData = data.map(item => {
              const curObj = values.find(v => v.id === item.id)
              return {
                ...item,
                groups: curObj.groups,
                users: curObj.users,
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
    this.initSidePageTab('project-detail')
    this.list.fetchData()
    this.$bus.$on('SystemProjectsListRefresh', args => {
      this.list.refresh()
    }, this)
  },
  methods: {
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'ProjectSidePage', {
        id: row.id,
        resource: 'projects',
        apiVersion: 'v1',
        getParams: this.getParams,
      }, {
        list: this.list,
        tab,
      })
    },
  },
}
</script>
