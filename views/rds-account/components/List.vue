<template>
  <page-list
    :columns="columns"
    :group-actions="groupActions"
    :list="list"
    :single-actions="singleActions" />
</template>

<script>
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'
import { getNameFilter, getStatusFilter } from '@/utils/common/tableFilter'

export default {
  name: 'RDSAccountList',
  mixins: [WindowsMixin, ColumnsMixin, SingleActionsMixin],
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
      groupActions: [
        {
          label: '新建',
          permission: 'rds_dbinstanceaccounts_create',
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
    }
  },
  created () {
    this.list.fetchData()
    this.initSidePageTab('detail')
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'RDSAccountSidePage', {
        id: row.id,
        resource: 'dbinstanceaccounts',
      }, {
        list: this.list,
        rdsItem: this.data,
      })
    },
  },
}
</script>
