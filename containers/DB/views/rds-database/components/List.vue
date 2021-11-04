<template>
  <page-list
    :columns="columns"
    :group-actions="groupActions"
    :list="list"
    :single-actions="singleActions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import ListMixin from '@/mixins/list'
import WindowsMixin from '@/mixins/windows'
import expectStatus from '@/constants/expectStatus'
import { getNameFilter, getStatusFilter } from '@/utils/common/tableFilter'
import { HYPERVISORS_MAP } from '@/constants'

export default {
  name: 'RDSDatabaseList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
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
        resource: 'dbinstancedatabases',
        getParams: this.params,
        steadyStatus: Object.values(expectStatus.rdsAccount).flat(),
        filterOptions: {
          name: getNameFilter(),
          status: getStatusFilter('rdsDatabase'),
        },
      }),
      groupActions: [
        {
          label: this.$t('db.text_41'),
          action: () => {
            this.createDialog('RDSDatabaseCreateDialog', {
              title: this.$t('db.text_231'),
              rdsItem: this.data,
              onManager: this.onManager,
              refresh: this.refresh,
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
    }
  },
  computed: {
    commonMeta () {
      const { status, provider, brand } = this.data
      const isRun = status === 'running'
      const isQcloud = provider === 'Qcloud'
      let tooltip = ''
      if (!isRun) {
        tooltip = this.$t('db.text_198')
      }
      if (isQcloud) {
        tooltip = this.$t('db.text_348')
      }
      const ret = {
        validate: isRun && !isQcloud,
        tooltip: tooltip,
      }
      if ((brand === HYPERVISORS_MAP.aws.brand || brand === HYPERVISORS_MAP.azure.brand) && ret.validate) {
        ret.validate = false
        ret.tooltip = this.$t('db.text_384', [brand])
      }
      return ret
    },
  },
  created () {
    this.list.fetchData()
    this.initSidePageTab('detail')
  },
  methods: {
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'RDSDatabaseSidePage', {
        id: row.id,
        resource: 'dbinstancedatabases',
        getParams: this.params,
        steadyStatus: Object.values(expectStatus.rdsDatabase).flat(),
      }, {
        list: this.list,
      })
    },
  },
}
</script>
