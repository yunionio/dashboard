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
import { getNameFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'CloudpolicyListForCloudgroupSidepage',
  mixins: [WindowsMixin, ListMixin],
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
        resource: 'cloudpolicies',
        apiVersion: 'v1',
        getParams: this.getParam,
        filterOptions: {
          name: getNameFilter(),
          description: {
            label: this.$t('cloudenv.text_331'),
            filter: true,
            formatter: val => `description.contains(${val})`,
          },
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
          label: this.$t('cloudenv.text_452'),
          permission: 'cloudpolicy_perform_revoke_group',
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('cloudenv.text_452'),
              name: this.$t('dictionary.cloudpolicy'),
              onManager: this.onManager,
              ok: async ids => {
                try {
                  const response = await this.manager.batchPerformAction({
                    ids,
                    action: 'revoke-group',
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
          label: this.$t('cloudenv.text_452'),
          permission: 'cloudpolicy_perform_revoke_group',
          action: (obj) => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: [obj],
              columns: this.columns,
              title: this.$t('cloudenv.text_452'),
              name: this.$t('dictionary.cloudpolicy'),
              onManager: this.onManager,
              ok: async ids => {
                try {
                  const response = await this.manager.batchPerformAction({
                    ids,
                    action: 'revoke-group',
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
          meta: (obj) => {
            const ret = {
              validate: true,
            }
            if (!this.isOwner()) {
              return {
                validate: false,
                tooltip: this.$t('common_614'),
              }
            }
            return ret
          },
        },
      ],
      columns: [
        {
          field: 'name',
          title: this.$t('common.name'),
          minWidth: 150,
          showOverflow: 'title',
        },
        {
          field: 'description',
          title: this.$t('table.column.title.desc'),
          minWidth: 250,
          showOverflow: 'title',
        },
      ],
    }
  },
  destroyed () {
    this.manager = null
  },
  created () {
    this.list.fetchData()
    this.$bus.$on('CloudpolicyListForCloudgroupSidepageRefresh', () => {
      this.list.refresh()
    }, this)
    this.manager = new this.$Manager('cloudpolicies', 'v1')
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
