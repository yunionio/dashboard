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
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import ColumnsMixin from '@Cloudenv/views/clouduser/mixins/columns'

export default {
  name: 'ClouduserListForCloudgroupSidepage',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
      default: () => ({}),
    },
    resId: String,
    data: Object,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'cloudusers',
        apiVersion: 'v1',
        getParams: this.getParam,
        filterOptions: {
          name: {
            label: this.$t('cloudenv.clouduser_list_t1'),
          },
          owner_name: {
            label: this.$t('cloudenv.clouduser_list_t4'),
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('table.title.name'), key: 'name' },
          { label: this.$t('cloudenv.clouduser_list_t5'), key: 'is_console_login' },
          { label: this.$t('cloudenv.text_98'), key: 'status' },
          { label: this.$t('cloudenv.clouduser_list_t3'), key: 'iam_login_url' },
          { label: this.$t('cloudenv.clouduser_list_t4'), key: 'owner_name' },
          { label: this.$t('table.title.brand'), key: 'brand' },
          { label: this.$t('common.text00108'), key: 'cloudaccount' },
        ],
      },
      groupActions: [
        {
          label: this.$t('common.remove'),
          permission: 'clouduser_perform_leave_group',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('common.remove'),
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
                  this.$bus.$emit('CloudgroupListSingleRefresh', this.resId)
                  return response
                } finally {}
              },
            })
          },
          meta: () => {
            if (!this.isOwner()) {
              return {
                validate: false,
                tooltip: this.$t('common_614'),
              }
            }
            return this.$getDeleteResult(this.list.selectedItems)
          },
        },
      ],
      singleActions: [
        {
          label: this.$t('common.remove'),
          permission: 'clouduser_perform_leave_group',
          action: (obj) => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: [obj],
              columns: this.columns,
              title: this.$t('common.remove'),
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
                  this.$bus.$emit('CloudgroupListSingleRefresh', this.resId)
                  return response
                } finally {}
              },
            })
          },
          meta: (obj) => {
            if (!this.isOwner()) {
              return {
                validate: false,
                tooltip: this.$t('common_614'),
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
    this.manager = new this.$Manager('cloudusers', 'v1')
    this.$bus.$on('CloudgroupSidepageClouduserListRefresh', () => {
      this.list.refresh()
    }, this)
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      return ret
    },
    isOwner () {
      return this.$store.getters.isAdminMode || (this.data && this.data.domain_id === this.$store.getters.userInfo.projectDomainId)
    },
  },
}
</script>
