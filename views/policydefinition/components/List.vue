<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import { mapGetters } from 'vuex'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import expectStatus from '@/constants/expectStatus'

export default {
  name: 'PolicydefinitionList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'policy_definitions',
        getParams: { details: true },
        filterOptions: {
          name: {
            label: '名称',
            filter: true,
            formatter: val => {
              return `name.contains("${val}")`
            },
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '名称', key: 'name' },
          { label: '状态', key: 'status' },
          { label: '类型', key: 'category' },
          { label: '参数', key: 'parameters' },
        ],
      },
      groupActions: [
        {
          label: '同步状态',
          permission: 'policydefinition_perform_syncstatus',
          action: () => {
            this.list.batchPerformAction('syncstatus', {}, { status: Object.values(expectStatus.policydefinition).flat() })
          },
          meta: () => {
            return {
              validate: this.list.selectedItems && this.list.selectedItems.length > 0,
              tooltip: '',
            }
          },
        },
      ],
    }
  },
  computed: mapGetters(['isAdminMode']),
  created () {
    this.initSidePageTab('policydefinition-detail')
    this.list.fetchData()
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'PolicydefinitionSidePage', {
        id: row.id,
        resource: 'policy_definitions',
        getParams: { details: true },
      }, {
        list: this.list,
      })
    },
  },
}
</script>
