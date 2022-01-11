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
import WindowsMixin from '@/mixins/windows'
import { getNameFilter } from '@/utils/common/tableFilter'
import { ENABLED_OPTS } from '@/constants'
import ListMixin from '@/mixins/list'

export default {
  name: 'DynamicschedtagList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'dynamicschedtags',
        getParams: { details: true },
        filterOptions: {
          name: getNameFilter(),
          enabled: {
            label: this.$t('cloudenv.text_97'),
            dropdown: true,
            multiple: true,
            items: ENABLED_OPTS,
          },
          schedpolicies: {
            label: this.$t('cloudenv.text_18'),
            filter: true,
            jointFilter: true,
            formatter: val => {
              return `schedtags.id(schedtag_id).name.contains("${val}")`
            },
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('cloudenv.text_95'), key: 'name' },
          { label: this.$t('cloudenv.text_97'), key: 'enabled' },
          { label: this.$t('cloudenv.text_18'), key: 'schedtag' },
          { label: this.$t('cloudenv.text_22'), key: 'condition' },
        ],
      },
      groupActions: [
        {
          label: this.$t('cloudenv.text_104'),
          action: () => {
            this.createDialog('CreateDynamicschedtagDialog', {
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
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('cloudenv.text_379'),
              name: this.$t('dictionary.dynamicschedtag'),
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
    this.initSidePageTab('dynamicschedtag-detail')
    this.list.fetchData()
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'DynamicschedtagSidePage', {
        id: row.id,
        resource: 'dynamicschedtags',
      }, {
        list: this.list,
      })
    },
  },
}
</script>
