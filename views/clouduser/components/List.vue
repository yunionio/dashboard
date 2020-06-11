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
  name: 'ClouduserList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Object, Function],
      default: () => ({}),
    },
    cloudaccount: Object,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'cloudusers',
        apiVersion: 'v1',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.clouduser).flat(),
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
          permission: 'clouduser_create',
          action: () => {
            this.createDialog('ClouduserCreateDialog', {
              onManager: this.onManager,
              cloudaccount: this.cloudaccount,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
        {
          label: this.$t('common.batchAction'),
          actions: () => {
            return [
              {
                label: this.$t('common.delete'),
                permission: 'clouduser_delete',
                action: () => {
                  this.createDialog('DeleteResDialog', {
                    vm: this,
                    data: this.list.selectedItems,
                    columns: this.columns,
                    title: this.$t('common.delete'),
                    name: this.$t('dictionary.clouduser'),
                    onManager: this.onManager,
                  })
                },
                meta: () => this.$getDeleteResult(this.list.selectedItems),
              },
            ]
          },
          meta: () => {
            return {
              validate: this.list.selectedItems && this.list.selectedItems.length > 0,
            }
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('clouduser-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        details: true,
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      return ret
    },
  },
}
</script>
