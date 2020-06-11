<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import * as R from 'ramda'
import { getNameFilter, getBrandFilter } from '@/utils/common/tableFilter'
import { getEnabledTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import PasswordFetcher from '@Compute/sections/PasswordFetcher'

export default {
  name: 'ClouduserListForCloudgroupSidepage',
  mixins: [WindowsMixin, ListMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
    resId: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'cloudusers',
        apiVersion: 'v1',
        getParams: this.getParam,
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
          label: this.$t('common.delete'),
          permission: 'clouduser_perform_leave_group',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('cloudenv.coludgroup_text002'),
              name: this.$t('cloudenv.coludgroup_text001'),
              onManager: this.onManager,
              ok: async ids => {
                try {
                  const response = await this.manager.batchPerformAction({
                    ids,
                    action: 'leave-group',
                    data: {
                      cloudgroup_id: this.resId,
                    },
                  })
                  this.list.refresh()
                  return response
                } finally {}
              },
            })
          },
          meta: () => this.$getDeleteResult(this.list.selectedItems),
        },
      ],
      singleActions: [
        {
          label: this.$t('common.delete'),
          permission: 'clouduser_perform_leave_group',
          action: (obj) => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: [obj],
              columns: this.columns,
              title: this.$t('cloudenv.coludgroup_text002'),
              name: this.$t('cloudenv.coludgroup_text001'),
              onManager: this.onManager,
              ok: async ids => {
                try {
                  const response = await this.manager.batchPerformAction({
                    ids,
                    action: 'leave-group',
                    data: {
                      cloudgroup_id: this.resId,
                    },
                  })
                  this.list.refresh()
                  return response
                } finally {}
              },
            })
          },
          meta: (obj) => this.$getDeleteResult(obj),
        },
      ],
      columns: [
        {
          field: 'name',
          title: this.$t('cloudenv.clouduser_list_t1'),
          minWidth: 120,
          showOverflow: 'title',
        },
        {
          field: 'password',
          title: this.$t('cloudenv.clouduser_list_t2'),
          width: 50,
          slots: {
            default: ({ row }) => {
              return [<PasswordFetcher serverId={ row.id } resourceType='cloudusers' />]
            },
          },
        },
        {
          field: 'iam_login_url',
          title: this.$t('cloudenv.clouduser_list_t3'),
          showOverflow: 'title',
          minWidth: 120,
          slots: {
            default: ({ row }) => {
              return [<help-link href={ row.iam_login_url } />]
            },
          },
        },
        {
          field: 'owner_name',
          title: this.$t('cloudenv.clouduser_list_t4'),
          minWidth: 120,
          showOverflow: 'title',
        },
        getEnabledTableColumn({
          field: 'is_console_login',
          title: this.$t('cloudenv.clouduser_list_t5'),
          minWidth: 100,
        }),
      ],
    }
  },
  destroyed () {
    this.manager = null
  },
  created () {
    this.list.fetchData()
    this.manager = new this.$Manager('cloudusers', 'v1')
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
