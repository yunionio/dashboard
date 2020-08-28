<template>
  <page-list
    :list="list"
    :columns="columns"
    :export-data-options="exportDataOptions"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :showGroupActions="showGroupActions"
    :showSingleActions="showSingleActions" />
</template>

<script>
import * as R from 'ramda'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import { getProjectDomainFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import { getDomainChangeOwnerAction } from '@/utils/common/tableActions'
// import { getDomainChangeOwnerAction, getSetPublicAction } from '@/utils/common/tableActions'

export default {
  name: 'RouteTableList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: [Object, Function],
    showGroupActions: {
      type: Boolean,
      default: true,
    },
    showSingleActions: {
      type: Boolean,
      default: true,
    },
    hiddenColumns: {
      type: Array,
      default: () => [],
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'route_tables',
        getParams: this.getParam,
        filterOptions: {
          name: {
            label: this.$t('network.text_21'),
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
          project_domain: getProjectDomainFilter(),
        },
        hiddenColumns: this.hiddenColumns,
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('network.text_21'), key: 'name' },
          { label: this.$t('network.text_535'), key: 'vpc' },
          { label: this.$t('network.text_199'), key: 'region' },
          { label: this.$t('network.text_196'), key: 'manager' },
          { label: this.$t('network.text_672'), key: 'routes' },
          {
            label: this.$t('network.text_232'),
            key: 'public_scope',
            hidden: () => {
              return !this.$store.getters.l3PermissionEnable && (this.$store.getters.scopeResource && this.$store.getters.scopeResource.domain.includes('route_tables'))
            },
          },
          { label: this.$t('network.text_233', [this.$t('dictionary.domain')]), key: 'project_domain' },
        ],
      },
      groupActions: [
        // {
        //   label: '同步状态',
        //   action: () => {
        //     this.onManager('batchPerformAction', {
        //       steadyStatus: ['running', 'ready'],
        //       managerArgs: {
        //         action: 'syncstatus',
        //       },
        //     })
        //   },
        //   meta: () => ({
        //     validate: this.list.selected.length,
        //   }),
        // },
        getDomainChangeOwnerAction(this, {
          name: this.$t('dictionary.route_table'),
          resource: 'route_tables',
        }),
        // getSetPublicAction(this, {
        //   name: this.$t('dictionary.route_table'),
        //   scope: 'domain',
        //   resource: 'route_tables',
        // }, {
        //   meta: () => {
        //     return {
        //       validate: this.list.selectedItems.length > 0,
        //     }
        //   },
        // }),
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
        details: true,
      }
      return ret
    },
  },
}
</script>
