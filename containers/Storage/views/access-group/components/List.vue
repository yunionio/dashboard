<template>
  <page-list
    :list="list"
    :columns="columns"
    :export-data-options="exportDataOptions"
    :group-actions="groupActions"
    :showSearchbox="showSearchbox"
    :showGroupActions="showGroupActions"
    :single-actions="singleActions" />
</template>

<script>
import * as R from 'ramda'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import expectStatus from '@/constants/expectStatus'
import { getStatusFilter, getProjectDomainFilter, getDescriptionFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import GlobalSearchMixin from '@/mixins/globalSearch'

export default {
  name: 'AccessGroupList',
  mixins: [WindowsMixin, ListMixin, GlobalSearchMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
    hiddenActions: {
      type: Array,
      default: () => ([]),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'access_groups',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.accessGroup).flat(),
        filterOptions: {
          id: {
            label: this.$t('table.title.id'),
          },
          name: {
            label: this.$t('storage.text_40'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          description: getDescriptionFilter(),
          status: getStatusFilter('accessGroup'),
          project_domains: getProjectDomainFilter(),
        },
        responseData: this.responseData,
        hiddenColumns: ['created_at'],
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('storage.text_40'), key: 'name' },
          { label: this.$t('storage.text_41'), key: 'status' },
          { label: this.$t('storage.created_at'), key: 'created_at' },
          {
            label: this.$t('storage.text_48'),
            key: 'public_scope',
            hidden: () => {
              return !this.$store.getters.l3PermissionEnable && (this.$store.getters.scopeResource && this.$store.getters.scopeResource.domain.includes('access_groups'))
            },
          },
          { label: this.$t('storage.text_49', [this.$t('dictionary.domain')]), key: 'project_domain' },
        ],
      },
      groupActions: [
        {
          label: this.$t('storage.text_31'),
          permission: 'access_groups_create',
          action: () => {
            this.createDialog('AccessGroupCreateDialog', {
              data: this.data,
              refresh: this.refresh,
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
          hidden: () => this.hiddenActions.includes('create'),
        },
        {
          label: this.$t('storage.text_33'),
          actions: (obj) => {
            return [
              {
                label: this.$t('storage.text_36'),
                permission: 'access_group_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    alert: this.$t('storage.text_266'),
                    columns: this.columns,
                    title: this.$t('storage.text_36'),
                    name: this.$t('dictionary.access_group'),
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
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('access-group-detail')
    this.list.fetchData()
    this.$bus.$on('access-group-refresh', () => {
      this.list.refresh()
    })
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
        detail: true,
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'AccessGroupSidePage', {
        id: row.id,
        resource: 'access_groups',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
