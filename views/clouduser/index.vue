<template>
  <div>
    <page-header :title="$t('common_325')" />
    <page-body>
      <page-list
        :list="list"
        :columns="columns"
        :single-actions="singleActions"
        :export-data-options="exportDataOptions" />
    </page-body>
  </div>
</template>

<script>
import PasswordFetcher from '@Compute/sections/PasswordFetcher'
import { getBrandTableColumn } from '@/utils/common/tableColumn'
import { getNameFilter, getBrandFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'ClouduserForUser',
  mixins: [WindowsMixin, ListMixin],
  data () {
    return {
      list: this.$list.createList(this, {
        id: 'ClouduserForUser',
        resource: 'cloudusers',
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
          { label: this.$t('table.column.title.name'), key: 'name' },
          { label: this.$t('table.column.title.brand'), key: 'brand' },
        ],
      },
      singleActions: [
        {
          label: this.$t('common_326'),
          action: (obj) => {
            this.createDialog('CloudgroupListForClouduserForUserDialog', {
              data: [obj],
            })
          },
        },
      ],
      columns: [
        {
          field: 'name',
          title: this.$t('common_327'),
          showOverflow: 'title',
        },
        {
          field: 'password',
          title: this.$t('common_328'),
          width: 50,
          slots: {
            default: ({ row }) => {
              return [<PasswordFetcher serverId={ row.id } resourceType='cloudusers' />]
            },
          },
        },
        getBrandTableColumn(),
        {
          field: 'iam_login_url',
          title: this.$t('common_329'),
          showOverflow: 'title',
          slots: {
            default: ({ row }) => {
              if (!row.iam_login_url) return '-'
              return [<help-link href={ row.iam_login_url } />]
            },
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
}
</script>
