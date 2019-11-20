<template>
  <page-list
    :columns="columns"
    :group-actions="groupActions"
    :list="list"
    :single-actions="singleActions" />
</template>

<script>
import PasswordFetcher from '@Compute/sections/PasswordFetcher'
import { ACCOUNT_PRIVILEGES } from '../constants'
import { getStatusTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'

export default {
  name: 'RDSAccountList',
  mixins: [WindowsMixin],
  props: {
    params: {
      type: Object,
    },
    data: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        resource: 'dbinstanceaccounts',
        getParams: this.params,
        steadyStatus: Object.values(expectStatus.redisAccount).flat(),
      }),
      columns: [
        {
          field: 'name',
          title: '名称',
        },
        getStatusTableColumn({ statusModule: 'rdsAccount' }),
        {
          field: 'password',
          title: '密码',
          slots: {
            default: ({ row }) => {
              return [<PasswordFetcher serverId={row.id} resourceType='dbinstanceaccounts' />]
            },
          },
        },
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
            this.createDialog('RDSAccountDialog', {
              list: this.list,
              redisItem: this.data,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
              ...this.commonMeta,
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
          meta: () => this.commonMeta,
        },
        {
          label: '修改权限',
          action: (obj) => {
            this.createDialog('RDSAccountListUpdatePrivilegeDialog', {
              title: '修改权限',
              initialValues: {
                account_privilege: obj['account_privilege'],
              },
              data: [obj],
              list: this.list,
              columns: this.columns,
              redisItem: this.data,
            })
          },
          meta: () => this.commonMeta,
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
          meta: (obj) => {
            const isHuawei = this.data.brand === 'Huawei'
            let tooltip = ''
            if (isHuawei) {
              tooltip = '华为云不支持此操作'
            }
            if (obj.account_type === 'admin') {
              tooltip = '主账号不允许删除'
            }
            return {
              validate: !isHuawei && obj.account_type !== 'admin',
              tooltip,
            }
          },
        },
      ],
    }
  },
  computed: {
    commonMeta () {
      const isRun = this.data.status === 'running'
      let tooltip = ''
      if (!isRun) {
        tooltip = '仅在运行中状态下支持新建操作'
      }
      return {
        validate: isRun,
        tooltip: tooltip,
      }
    },
  },
  created () {
    this.list.fetchData()
  },
}
</script>
