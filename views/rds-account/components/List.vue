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
import ListMixin from '@/mixins/list'
import expectStatus from '@/constants/expectStatus'
import { getNameFilter, getStatusFilter } from '@/utils/common/tableFilter'

export default {
  name: 'RDSAccountList',
  mixins: [WindowsMixin, ColumnsMixin, SingleActionsMixin, ListMixin],
  props: {
    params: {
      type: Object,
    },
    data: {
      type: Object,
    },
    id: {
      type: String,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
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
          label: this.$t('db.text_41'),
          permission: 'rds_dbinstanceaccounts_create',
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
