<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
// import * as R from 'ramda'
import { getBrandTableColumn } from '@/utils/common/tableColumn'
// import { getBrandTableColumn, getNameDescriptionTableColumn } from '@/utils/common/tableColumn'
import { getNameFilter, getBrandFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'SamluserListForUser',
  mixins: [WindowsMixin, ListMixin],
  data () {
    return {
      list: this.$list.createList(this, {
        id: 'SamluserForUser',
        resource: 'samlusers',
        apiVersion: 'v1',
        getParams: {
          user: this.$store.getters.userInfo.id,
        },
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
      singleActions: [
        {
          label: this.$t('common_326'),
          action: (obj) => {
            this.createDialog('CloudpoliciesListForClouduserForUserDialog', {
              data: [obj],
            })
          },
        },
        {
          label: this.$t('table.action.smal_login'),
          action: (obj) => {
            this.samlLogin(obj)
          },
        },
      ],
      columns: [
        {
          field: 'name',
          title: this.$t('common_327'),
          showOverflow: 'title',
        },
        getBrandTableColumn(),
        {
          field: 'cloudgroups',
          title: this.$t('common_624', [this.$t('dictionary.cloudgroup')]),
          slots: {
            default: ({ row }) => {
              return row.cloudgroup
            },
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    async samlLogin (row) {
      let manager = new this.$Manager('cloudaccounts')
      const hiddenLoadingMessage = this.$message.loading(this.$t('smal_login_message.loading'), 0)
      try {
        const response = await manager.getSpecific({
          id: row.cloudaccount_id,
          spec: 'saml',
        })
        if (response.data.init_login_url) {
          window.open(response.data.init_login_url, '_blank')
        } else {
          this.$message.error(this.$t('smal_login_message.fail'))
        }
      } catch (error) {
        this.$message.error(this.$t('smal_login_message.fail'))
        throw error
      } finally {
        hiddenLoadingMessage()
        manager = null
      }
    },
  },
}
</script>
