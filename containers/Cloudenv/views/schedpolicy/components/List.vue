<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { STRATEGY_OPT } from '@Cloudenv/constants/sched'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import { getNameFilter, getEnabledFilter, getFilter, getDescriptionFilter, getCreatedAtFilter } from '@/utils/common/tableFilter'

const getParams = { details: true }

export default {
  name: 'SchedpolicyList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'schedpolicies',
        getParams,
        filterOptions: {
          name: getNameFilter(),
          description: getDescriptionFilter(),
          enabled: getEnabledFilter(),
          strategy: {
            label: this.$t('cloudenv.text_413'),
            dropdown: true,
            multiple: true,
            items: STRATEGY_OPT,
          },
          schedtag: getFilter({
            field: 'schedtag',
            title: this.$t('cloudenv.text_18'),
          }),
          created_at: getCreatedAtFilter(),
        },
        hiddenColumns: ['created_at'],
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('cloudenv.text_95'), key: 'name' },
          { label: this.$t('cloudenv.text_97'), key: 'enabled' },
          { label: this.$t('cloudenv.text_413'), key: 'strategy' },
          { label: this.$t('cloudenv.text_18'), key: 'schedtag' },
          { label: this.$t('cloudenv.text_22'), key: 'condition' },
          { label: this.$t('common.createdAt'), key: 'created_at' },
        ],
      },
      groupActions: [
        {
          label: this.$t('cloudenv.text_104'),
          permission: 'schedpolicies_create',
          action: () => {
            this.createDialog('CreateSchedpolicyDialog', {
              title: this.$t('cloudenv.text_414'),
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('cloudenv.text_108'),
          permission: 'schedpolicies_delete',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('cloudenv.text_415'),
              name: this.$t('dictionary.schedpolicie'),
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              validate: this.list.allowDelete(),
            }
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('schedpolicy-detail')
    this.list.fetchData()
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'SchedpolicySidePage', {
        id: row.id,
        resource: 'schedpolicies',
        getParams,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
