<template>
  <div>
    <a-alert :message="$t('cloudenv.clouduser_desc')" class="mb-2" />
    <page-list
      :list="list"
      :columns="columns"
      :group-actions="groupActions"
      :single-actions="singleActions"
      :export-data-options="exportDataOptions" />
  </div>
</template>

<script>
import * as R from 'ramda'
import ColumnsMixin from '@Cloudenv/views/clouduser/mixins/columns'
import { getNameFilter, getBrandFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import expectStatus from '@/constants/expectStatus'

export default {
  name: 'ClouduserList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin],
  props: {
    getParams: {
      type: [Object, Function],
      default: () => ({}),
    },
    data: Object,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: 'ClouduserListForUserSidepage',
        resource: 'cloudusers',
        apiVersion: 'v1',
        getParams: this.getParam,
        steadyStatus: Object.values(expectStatus.clouduser).flat(),
        filterOptions: {
          name: getNameFilter(),
          provider: getBrandFilter('cloud_id_brands'),
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('table.title.name'), key: 'name' },
          { label: this.$t('table.title.brand'), key: 'brand' },
        ],
      },
      groupActions: [
        {
          label: `${this.$t('common.create')}`,
          permission: 'clouduser_create',
          action: () => {
            this.createDialog('ClouduserCreateForUserDialog', {
              user: this.data,
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
      ],
      singleActions: [
        {
          label: this.$t('common.delete'),
          permission: 'clouduser_delete',
          action: (obj) => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: [obj],
              columns: this.columns,
              title: this.$t('common.delete'),
              name: this.$t('dictionary.clouduser'),
              onManager: this.onManager,
            })
          },
          meta: (obj) => this.$getDeleteResult(obj),
        },
      ],
    }
  },
  created () {
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
