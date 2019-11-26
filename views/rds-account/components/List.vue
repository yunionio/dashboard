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
        getNameDescriptionTableColumn({
          vm: this,
          hideField: true,
          addLock: true,
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
          slots: {
            default: ({ row }) => {
              return [<PasswordFetcher serverId={row.id} resourceType='dbinstanceaccounts' />]
            },
          },
        },
        {
          field: 'dbinstanceprivileges',
          title: '已授权的数据库',
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
            this.createDialog('RDSAccountUpdatePrivilegeDialog', {
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
              title: '删除白名单',
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
    this.initSidePageTab('detail')
  },
}
</script>
