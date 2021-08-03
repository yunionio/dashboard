<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions" />
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import {
  getNameFilter,
  getBrandFilter,
  getStatusFilter,
  getTenantFilter,
  getAccountFilter,
  getRegionFilter,
  getCloudProviderFilter,
} from '@/utils/common/tableFilter'

export default {
  name: 'WebAppList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: Object,
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'webapps',
        getParams: this.getParam,
        filterOptions: {
          name: getNameFilter(),
          brand: getBrandFilter('compute_engine_brands'),
          status: getStatusFilter('webapp'),
          tech_stack: {
            label: this.$t('compute.webapp.tech.stack'),
            formatter: val => {
              return `${val}`
            },
          },
          projects: getTenantFilter(),
          cloudaccount: getAccountFilter(),
          manager: getCloudProviderFilter(),
          region: getRegionFilter(),
        },
      }),
      groupActions: [
        {
          label: this.$t('common.text00043'),
          action: () => {
            this.onManager('batchPerformAction', {
              steadyStatus: ['ready'],
              managerArgs: {
                action: 'syncstatus',
              },
            })
          },
          meta: () => ({
            validate: this.list.selected.length,
          }),
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...this.getParams,
        details: true,
      }
      return ret
    },
    handleOpenSidepage (row) {
      this.sidePageTriggerHandle(this, 'WebAppSidePage', {
        id: row.id,
        resource: 'webapps',
        getParams: this.getParam,
      }, {
        list: this.list,
      })
    },
  },
}
</script>
