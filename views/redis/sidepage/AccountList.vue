<template>
  <page-list
    :columns="columns"
    :group-actions="groupActions"
    :list="list"
    :single-actions="singleActions" />
</template>

<script>
import { ACCOUNT_PRIVILEGES } from '../constants'
import { getStatusTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'RedisAccountList',
  mixins: [WindowsMixin],
  props: {
    getParams: {
      type: Function,
    },
    data: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'elasticcacheaccounts',
        getParams: this.getParams,
      }),
      columns: [
        {
          field: 'name',
          title: '名称',
        },
        getStatusTableColumn({ statusModule: 'redisAccount' }),
        {
          field: 'ip',
          title: '权限',
          slots: {
            default: ({ row }) => {
              return ACCOUNT_PRIVILEGES[row.account_privilege] || '-'
            },
          },
        },
      ],
      groupActions: [
        {
          label: '新建',
          action: () => {
            this.createDialog('RedisAccountDialog', {
              list: this.list,
              redisItem: this.data,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
      ],
      singleActions: [
        {
          label: '重置密码',
          action: (obj) => {
            this.createDialog('RedisAccountLisResetPwdDialog', {
              data: [obj],
              list: this.list,
              columns: this.columns,
              redisItem: this.data,
            })
          },
        },
        {
          label: '修改权限',
          action: (obj) => {
            this.createDialog('RedisAccountListSetPrivilegeDialog', {
              initialValues: {
                account_privilege: obj['account_privilege'],
              },
              data: [obj],
              list: this.list,
              columns: this.columns,
              redisItem: this.data,
            })
          },
        },
        {
          label: '删除',
          action: (obj) => {
            this.createDialog('RedisWhiteListDeleteDialog', {
              data: [obj],
              columns: this.columns,
              title: '删除白名单',
              list: this.list,
            })
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
    console.log(this.data)
  },
}
</script>
