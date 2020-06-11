<template>
  <div>
    <page-header title="公有云子账号" />
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
      singleActions: [
        {
          label: '查看权限',
          permission: 'cloudpolicy_list',
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
          title: '用户名',
          showOverflow: 'title',
        },
        {
          field: 'password',
          title: '密码',
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
          title: '登录地址',
          showOverflow: 'title',
          slots: {
            default: ({ row }) => {
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
