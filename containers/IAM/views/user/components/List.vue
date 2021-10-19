<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import { getEnabledFilter, getProjectDomainFilter } from '@/utils/common/tableFilter'
import { getEnabledSwitchActions } from '@/utils/common/tableActions'
import GlobalSearchMixin from '@/mixins/globalSearch'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

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
        },
        responseData: this.responseData,
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('system.text_101'), key: 'name' },
          { label: this.$t('scope.text_245'), key: 'displayname' },
          { label: this.$t('dictionary.domain'), key: 'project_domain' },
          { label: this.$t('system.text_163'), key: 'enabled' },
          { label: this.$t('system.text_475'), key: 'allow_web_console' },
        ],
      },
    }
  },
  computed: {
    groupActions () {
      const actions = [
        {
          label: this.$t('system.text_128'),
          action: () => {
            this.$router.push('/systemuser/create')
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('system.text_478'),
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
                action: () => {
                  this.createDialog('UserUpdateDialog', {
                    data: this.list.selectedItems,
                    columns: this.columns,
                    onManager: this.onManager,
                  })
                },
              },
              ...getEnabledSwitchActions(this, undefined, undefined, {
                actions: [
                  () => {
                    this.onManager('batchUpdate', {
                      ids: this.list.selectedItems.map(({ id }) => id),
                      managerArgs: {
                        data: {
                          enabled: true,
                        },
                      },
                    })
                  },
                  () => {
                    this.onManager('batchUpdate', {
                      ids: this.list.selectedItems.map(({ id }) => id),
                      managerArgs: {
                        data: {
                          enabled: false,
                        },
                      },
                    })
                  },
                ],
              }),
              {
                label: this.$t('system.text_129'),
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
