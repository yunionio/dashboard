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
import { getStatusTableColumn, getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'
import { getNameFilter, getStatusFilter } from '@/utils/common/tableFilter'
export default {
  name: 'RedisAccountList',
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
    const steadyStatus = Object.values(expectStatus.redisAccount).flat()
    return {
      steadyStatus,
      list: this.$list.createList(this, {
        resource: 'elasticcacheaccounts',
        getParams: this.params,
        steadyStatus,
        filterOptions: {
          name: getNameFilter(),
          status: getStatusFilter('redisAccount'),
        },
      }),
      columns: [
        getCopyWithContentTableColumn(),
        getStatusTableColumn({ statusModule: 'redisAccount' }),
        {
          field: 'password',
          title: '密码',
          width: 100,
          slots: {
            default: ({ row }) => {
              return [<PasswordFetcher serverId={row.id} resourceType='elasticcacheaccounts' />]
            },
          },
        },
        {
          field: 'account_type',
          title: '账号类型',
          minWidth: 100,
          slots: {
            default: ({ row }) => {
              return row.account_type === 'admin' ? '管理员' : '普通账号'
            },
          },
        },
        {
          field: 'ip',
          title: '权限',
          minWidth: 150,
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
          permission: 'redis_elasticcacheaccounts_create',
          action: () => {
            this.createDialog('RedisAccountDialog', {
              list: this.list,
              redisItem: this.data,
            })
          },
          meta: () => {
            let validate = true
            let tooltip = ''
            if (this.data.brand === 'Huawei') {
              validate = false
              tooltip = '华为云不支持此操作'
            }
            if (this.data.brand === 'Aliyun' && this.data.engine_version === '2.8') {
              validate = false
              tooltip = '阿里云Redis2.8不支持此操作'
            }
            return {
              buttonType: 'primary',
              validate,
              tooltip,
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
              steadyStatus: this.steadyStatus,
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
            this.createDialog('RedisAccountListSetPrivilegeDialog', {
              title: '修改权限',
              steadyStatus: this.steadyStatus,
              initialValues: {
                account_privilege: obj['account_privilege'],
              },
              data: [obj],
              list: this.list,
              columns: this.columns,
              redisItem: this.data,
            })
          },
          meta: (obj) => {
            const isAdmin = obj.account_type === 'admin'
            return {
              validate: this.commonMeta.validate && !isAdmin,
              tooltip: this.commonMeta.tooltip || (isAdmin ? '阿里云主账号不支持此操作' : null),
            }
          },
        },
        {
          label: '删除',
          permission: 'redis_elasticcacheaccounts_delete',
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
              validate: !tooltip,
              tooltip,
            }
          },
        },
      ],
    }
  },
  computed: {
    commonMeta () {
      const isHuawei = this.data.brand === 'Huawei'
      return {
        validate: !isHuawei,
        tooltip: isHuawei ? '华为云不支持此操作' : null,
      }
    },
  },
  created () {
    this.list.fetchData()
  },
}
</script>
