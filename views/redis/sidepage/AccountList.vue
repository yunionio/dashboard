<template>
  <page-list
    :columns="columns"
    :group-actions="groupActions"
    :list="list"
    :single-actions="singleActions" />
</template>

<script>
import { ACCOUNT_PRIVILEGES } from '../constants'
import PasswordFetcher from '@Compute/sections/PasswordFetcher'
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
          title: this.$t('db.text_195'),
          width: 100,
          slots: {
            default: ({ row }) => {
              return [<PasswordFetcher serverId={row.id} resourceType='elasticcacheaccounts' />]
            },
          },
        },
        {
          field: 'account_type',
          title: this.$t('db.text_309'),
          minWidth: 100,
          slots: {
            default: ({ row }) => {
              return row.account_type === 'admin' ? this.$t('db.text_310') : this.$t('db.text_311')
            },
          },
        },
        {
          field: 'ip',
          title: this.$t('db.text_196'),
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
          label: this.$t('db.text_41'),
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
              tooltip = this.$t('db.text_202')
            }
            if (this.data.brand === 'Aliyun' && this.data.engine_version === '2.8') {
              validate = false
              tooltip = this.$t('db.text_312')
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
          label: this.$t('db.text_201'),
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
          label: this.$t('db.text_203'),
          action: (obj) => {
            this.createDialog('RedisAccountListSetPrivilegeDialog', {
              title: this.$t('db.text_203'),
              steadyStatus: this.steadyStatus,
              initialValues: {
                account_privilege: obj.account_privilege,
              },
              data: [obj],
              list: this.list,
              columns: this.columns,
              redisItem: this.data,
            })
          },
          meta: (obj) => {
            const isAdmin = obj.account_type === 'admin'
            const brandMap = {
              Aliyun: this.$t('db.text_52'),
              Qcloud: this.$t('db.text_361'),
            }
            return {
              validate: this.commonMeta.validate && !isAdmin,
              tooltip: this.commonMeta.tooltip || (isAdmin ? this.$t('db.text_313', [brandMap[obj.brand]]) : null),
            }
          },
        },
        {
          label: this.$t('db.text_42'),
          permission: 'redis_elasticcacheaccounts_delete',
          action: (obj) => {
            this.createDialog('RedisWhiteListDeleteDialog', {
              data: [obj],
              columns: this.columns,
              title: this.$t('db.text_206'),
              list: this.list,
            })
          },
          meta: (obj) => {
            const isHuawei = this.data.brand === 'Huawei'
            let tooltip = ''
            if (isHuawei) {
              tooltip = this.$t('db.text_202')
            }
            if (obj.account_type === 'admin') {
              tooltip = this.$t('db.text_315')
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
        tooltip: isHuawei ? this.$t('db.text_202') : null,
      }
    },
  },
  created () {
    this.list.fetchData()
  },
}
</script>
