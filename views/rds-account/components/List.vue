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
          title: this.$t('db.text_195'),
          minWidth: 100,
          slots: {
            default: ({ row }) => {
              return [<PasswordFetcher serverId={row.id} resourceType='dbinstanceaccounts' />]
            },
          },
        },
        {
          field: this.$t('db.text_194'),
          minWidth: 200,
          title: this.$t('db.text_196'),
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
          label: this.$t('db.text_41'),
          action: () => {
            this.createDialog('RDSAccountCreateDialog', {
              list: this.list,
              title: this.$t('db.text_197'),
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
                  tooltip: this.$t('db.text_198'),
                }
              }
              if (engine === 'SQLServer' && provider === 'Huawei') {
                return {
                  validate: false,
                  tooltip: this.$t('db.text_199'),
                }
              }
              if (engine === 'PostgreSQL' && provider === 'Huawei') {
                return {
                  validate: false,
                  tooltip: this.$t('db.text_200'),
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
          label: this.$t('db.text_201'),
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
                tooltip: this.$t('db.text_202'),
              }
            }
            return this.commonMeta
          },
        },
        {
          label: this.$t('db.text_203'),
          action: (obj) => {
            this.createDialog('RDSAccountUpdatePrivilegeDialog', {
              title: this.$t('db.text_203'),
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
                tooltip: this.$t('db.text_204'),
              }
            }
            if (isGoogle) {
              return {
                validate: false,
                tooltip: this.$t('db.text_205'),
              }
            }
            return {
              validate: true,
            }
          },
        },
        {
          label: this.$t('db.text_42'),
          action: (obj) => {
            this.createDialog('RedisWhiteListDeleteDialog', {
              data: [obj],
              columns: this.columns,
              title: this.$t('db.text_206'),
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
        tooltip = this.$t('db.text_198')
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
