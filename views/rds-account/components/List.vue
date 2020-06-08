<template>
  <page-list
    :columns="columns"
    :group-actions="groupActions"
    :list="list"
    :single-actions="singleActions" />
</template>

<script>
import PasswordFetcher from '@Compute/sections/PasswordFetcher'
import { RDS_ACCOUNT_PRIVILEGES } from '@DB/constants'
import { getStatusTableColumn, getNameDescriptionTableColumn } from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'
import { getNameFilter, getStatusFilter } from '@/utils/common/tableFilter'

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
        filterOptions: {
          name: getNameFilter(),
          status: getStatusFilter('rdsAccount'),
        },
      }),
      columns: [
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          edit: false,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={() => this.sidePageTriggerHandle(row.id, 'RDSAcountSidePage')}>{row.name}</side-page-trigger>
            )
          },
        }),
        getStatusTableColumn({ statusModule: 'rdsAccount' }),
        {
          field: 'password',
          title: '密码',
          minWidth: 100,
          slots: {
            default: ({ row }) => {
              return [<PasswordFetcher serverId={row.id} resourceType='dbinstanceaccounts' />]
            },
          },
        },
        {
          field: '已授权的数据库',
          minWidth: 200,
          title: '权限',
          slots: {
            default: ({ row }) => {
              if (row.dbinstanceprivileges && row.dbinstanceprivileges.length > 0) {
                return row.dbinstanceprivileges.map(({ database, privileges }) => {
                  return <div>{database} <span style="color:#666;margin:0 0 0 3px">({RDS_ACCOUNT_PRIVILEGES[privileges]})</span></div>
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
            this.createDialog('RDSAccountCreateDialog', {
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
            })
          },
          meta: () => {
            if (this.commonMeta.isHuawei) {
              return {
                validate: false,
                tooltip: '华为云不支持此操作',
              }
            }
            return this.commonMeta
          },
        },
        {
          label: '修改权限',
          action: (obj) => {
            this.createDialog('RDSAccountUpdatePrivilegeDialog', {
              title: '修改权限',
              initialValues: {
                account_privilege: obj.account_privilege,
              },
              data: [obj],
              list: this.list,
              columns: this.columns,
              rdsItem: this.data,
            })
          },
          meta: (obj) => {
            const { isHuawei, isGoogle } = this.commonMeta
            if (isHuawei && obj.name === 'root') {
              return {
                validate: false,
                tooltip: '华为云主账号不支持此操作',
              }
            }
            if (isGoogle) {
              return {
                validate: false,
                tooltip: '谷歌云不支持此操作',
              }
            }
            return {
              validate: true,
            }
          },
        },
        {
          label: '删除',
          action: (obj) => {
            this.createDialog('RedisWhiteListDeleteDialog', {
              data: [obj],
              columns: this.columns,
              title: '删除账号',
              list: this.list,
            })
          },
          meta: (obj) => {
            const { tooltip, isAliyun } = this.commonMeta
            return {
              validate: obj.name !== 'root' || (!tooltip && isAliyun),
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
      const isGoogle = this.data.brand === 'Google'
      let tooltip = ''
      if (!isRunning) {
        tooltip = '仅在运行中状态下支持新建操作'
      }
      return {
        isRunning,
        isHuawei,
        isAliyun,
        isGoogle,
        tooltip,
        validate: isRunning,
      }
    },
  },
  created () {
    this.list.fetchData()
    this.initSidePageTab('detail')
  },
}
</script>
