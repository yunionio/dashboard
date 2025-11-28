<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions" />
</template>

<script>
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import { getProjectDomainFilter, getDescriptionFilter, getCreatedAtFilter } from '@/utils/common/tableFilter'
import {
  getSetPublicAction,
} from '@/utils/common/tableActions'
import GlobalSearchMixin from '@/mixins/globalSearch'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'RoleList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
    },
    resource: String,
    resId: String,
    hiddenActions: {
      type: Array,
      default: () => ([]),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'roles',
        apiVersion: 'v1',
        getParams: this.getParam,
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
          project_domains: getProjectDomainFilter(),
          created_at: getCreatedAtFilter(),
        },
        responseData: this.responseData,
        hiddenColumns: ['created_at'],
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('system.text_101'), key: 'name' },
          { label: this.$t('dictionary.domain'), key: 'project_domain' },
          { label: this.$t('common.createdAt'), key: 'created_at' },
        ],
      },
      groupActions: [
        {
          label: this.$t('system.text_128'),
          permission: 'roles_create',
          action: () => {
            this.createDialog('RoleCreateDialog', {
              domain: this.resource === 'domains' ? this.resId : '',
              success: () => {
                this.refresh()
              },
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
          hidden: () => this.hiddenActions.includes('create'),
        },
        getSetPublicAction(this, {
          name: this.$t('dictionary.role'),
          scope: 'domain',
          resource: 'roles',
          apiVersion: 'v1',
          noCandidateDomains: true,
        }, {
          permission: 'roles_perform_public',
          meta: () => {
            return {
              validate: this.list.selectedItems.length,
            }
          },
        }),
        {
          label: this.$t('system.text_129'),
          permission: 'roles_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('system.text_129'),
              onManager: this.onManager,
              name: this.$t('dictionary.role'),
            })
          },
          meta: () => this.$getDeleteResult(this.list.selectedItems),
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('role-detail')
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
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'RoleSidePage', {
        id: row.id,
        resource: 'roles',
        apiVersion: 'v1',
        getParams: this.getParam,
      }, {
        list: this.list,
        hiddenActions: this.hiddenActions,
      })
    },
  },
}
</script>
