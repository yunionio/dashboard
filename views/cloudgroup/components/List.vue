<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import * as R from 'ramda'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { getNameFilter, getBrandFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import expectStatus from '@/constants/expectStatus'

export default {
  name: 'CloudaccountList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'cloudgroups',
        apiVersion: 'v1',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.cloudgroup).flat(),
        filterOptions: {
          name: getNameFilter(),
          provider: getBrandFilter(),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('table.column.title.name'), key: 'name' },
          { label: this.$t('table.column.title.brand'), key: 'brand' },
        ],
      },
      groupActions: [
        {
          label: this.$t('common.create'),
          permission: 'cloudgroup_create',
          action: () => {
            this.createDialog('CloudgroupCreateDialog', {
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('cloudgroup-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      return ret
    },
  },
}
</script>
