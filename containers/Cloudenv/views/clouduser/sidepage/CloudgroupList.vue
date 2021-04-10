<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions"
    :export-data-options="exportDataOptions"
    :expand-config="{ lazy: true, loadMethod: loadPolicy }" />
</template>

<script>
import * as R from 'ramda'
import ColumnsMixin from '@Cloudenv/views/cloudgroup/mixins/columns'
import { getNameFilter, getBrandFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'CloudgroupListForClouduserSidepage',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin],
  props: {
    getParams: {
      type: Object,
      default: () => ({}),
    },
    resId: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: 'CloudgroupListForClouduserSidepage',
        resource: 'cloudgroups',
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
          { label: this.$t('table.title.name'), key: 'name' },
          { label: this.$t('table.title.brand'), key: 'brand' },
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
              title: this.$t('cloudenv.cloudgroup_delete_tip'),
              name: this.$t('dictionary.cloudgroup'),
              onManager: this.onManager,
              ok: async ids => {
                try {
                  const response = await this.manager.batchPerformAction({
                    ids,
                    action: 'remove-user',
                    data: {
                      clouduser_id: this.resId,
                    },
                  })
                  this.list.refresh()
                  return response
                } finally {}
              },
            })
          },
          meta: () => {
            if (this.list.selectedItems.length < 0) {
              return {
                validate: false,
              }
            }
            if (!this.$store.getters.isAdminMode) {
              if (this.list.selectedItems.some(item => item.domain_id !== this.$store.getters.userInfo.domain.id)) {
                return {
                  validate: false,
                }
              }
            }
            return this.$getDeleteResult(this.list.selectedItems)
          },
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
              title: this.$t('cloudenv.cloudgroup_delete_tip'),
              name: this.$t('dictionary.cloudgroup'),
              onManager: this.onManager,
              ok: async ids => {
                try {
                  const response = await this.manager.batchPerformAction({
                    ids,
                    action: 'remove-user',
                    data: {
                      clouduser_id: this.resId,
                    },
                  })
                  this.list.refresh()
                  return response
                } finally {}
              },
            })
          },
          meta: (obj) => {
            if (!this.$store.getters.isAdminMode) {
              if (obj.domain_id !== this.$store.getters.userInfo.domain.id) {
                return {
                  validate: false,
                }
              }
            }
            return this.$getDeleteResult(obj)
          },
        },
      ],
    }
  },
  destroyed () {
    this.manager = null
  },
  created () {
    this.list.fetchData()
    this.$bus.$on('CloudgroupListForClouduserSidepageRefresh', () => {
      this.list.refresh()
    }, this)
    this.manager = new this.$Manager('cloudgroups', 'v1')
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
