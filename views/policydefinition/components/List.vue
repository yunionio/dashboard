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
            label: this.$t('cloudenv.text_95'),
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
          { label: this.$t('cloudenv.text_95'), key: 'name' },
          { label: this.$t('cloudenv.text_98'), key: 'status' },
          { label: this.$t('cloudenv.text_360'), key: 'category' },
          { label: this.$t('cloudenv.text_389'), key: 'parameters' },
        ],
      },
      groupActions: [
        {
          label: this.$t('cloudenv.text_354'),
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
