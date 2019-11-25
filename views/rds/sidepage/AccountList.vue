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
          field: '已授权的数据库',
          title: '权限',
          slots: {
            default: ({ row }) => {
              if (row.dbinstanceprivileges && row.dbinstanceprivileges.length > 0) {
                return row.dbinstanceprivileges.map(({ database, privileges }) => {
                  return <div>{database} <span style="color:#666;margin:0 0 0 3px">({ACCOUNT_PRIVILEGES[privileges]})</span></div>
                })
              }
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
              title: '新建账号',
              rdsItem: this.data,
            })
          },
          meta: () => {
            const { engine, provider } = this.data
            const { isRunning } = this.commonMeta
            const _meta = () => {
              if (!isRunning) {
                return {
                  validate: false,
                  tooltip: '仅在运行中状态下支持新建操作',
                }
              }
              if (engine === 'SQLServer' && provider === 'Huawei') {
                return {
                  validate: false,
                  tooltip: 'SQLServer数据库引擎，暂不支持此操作',
                }
              }
              if (engine === 'PostgreSQL' && provider === 'Huawei') {
                return {
                  validate: false,
                  tooltip: '华为云PostgreSQL数据库引擎，暂不支持此操作',
                }
              }
              return {
                validate: true,
                tooltip: '',
              }
            }
            return {
              buttonType: 'primary',
              ..._meta(),
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
              rdsItem: this.data,
            })
          },
          meta: (obj) => {
            const { isHuawei } = this.commonMeta
            return {
              validate: !(isHuawei && obj.name === 'root'),
              tooltip: (isHuawei && obj.name === 'root') ? '华为云主账号不支持此操作' : '',
            }
          },
        },
        {
          label: '删除',
          action: (obj) => {
            this.createDialog('RedisWhiteListDeleteDialog', {
              data: [obj],
              columns: this.columns,
              name: '账号',
              title: '删除账号',
              list: this.list,
            })
          },
          meta: (obj) => {
            const { isHuawei, tooltip } = this.commonMeta
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
      const isRunning = this.data.status === 'running'
      const isHuawei = this.data.brand === 'Huawei'
      const isAliyun = this.data.brand === 'Aliyun'
      let tooltip = ''
      if (!isRunning) {
        tooltip = '仅在运行中状态下支持新建操作'
      }
      return {
        isRunning,
        isHuawei,
        isAliyun,
        tooltip,
        validate: isRunning,
      }
    },
  },
  created () {
    this.list.fetchData()
  },
}
</script>
