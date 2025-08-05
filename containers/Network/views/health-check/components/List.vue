<template>
  <page-list
    :list="list"
    :columns="columns"
    :single-actions="singleActions"
    :group-actions="groupActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import * as R from 'ramda'
import ListMixin from '@/mixins/list'
import expectStatus from '@/constants/expectStatus'
import {
  getStatusFilter,
  getDescriptionFilter,
  getCreatedAtFilter,
  getProjectFilter,
  getBrandFilter,
} from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'
import SingleActionsMixin from '../mixins/singleActions'
import ColumnsMixin from '../mixins/columns'

export default {
  name: 'HealthCheckList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
  },
  data () {
    const filterOptions = {
      id: {
        label: this.$t('table.title.id'),
      },
      name: {
        label: this.$t('network.text_21'),
        filter: true,
        formatter: val => {
          return `name.contains("${val}")`
        },
      },
      description: getDescriptionFilter(),
      status: getStatusFilter('healthCheck'),
      brand: getBrandFilter(),
      project: getProjectFilter(),
      created_at: getCreatedAtFilter(),
    }
    return {
      list: this.$list.createList(this, {
        ctx: this,
        id: this.id,
        resource: 'loadbalancer_health_checks',
        getParams: this.getParam,
        filterOptions,
        responseData: this.responseData,
        steadyStatus: {
          status: Object.values(expectStatus.healthCheck).flat(),
        },
      }),
      groupActions: [
        {
          label: this.$t('network.text_26'),
          permission: 'sslcertificates_create',
          action: () => {
            this.createDialog('HealthCheckCreateDialog', {
              onManager: this.onManager,
            })
          },
          meta: () => {
            return {
              buttonType: 'primary',
            }
          },
        },
      ],
    }
  },
  computed: {
    exportDataOptions () {
      return {
        downloadType: 'local',
        title: this.$t('network.health_check'),
        items: this.columns,
      }
    },
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
      }
      if (this.cloudEnv) ret.cloud_env = this.cloudEnv
      return ret
    },
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'HealthCheckSidePage', {
        id: row.id,
        resource: 'loadbalancer_health_checks',
        getParams: this.getParam,
      }, {
        list: this.list,
        tab,
      })
    },
  },
}
</script>
