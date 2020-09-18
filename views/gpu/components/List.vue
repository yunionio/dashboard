<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import * as R from 'ramda'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'
import { getNameFilter } from '@/utils/common/tableFilter'
import expectStatus from '@/constants/expectStatus'
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'

export default {
  name: 'GpuList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  props: {
    id: String,
    getParams: {
      type: [Function, Object],
    },
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        resource: 'isolated_devices',
        getParams: this.getParam,
        filterOptions: {
          name: getNameFilter(),
          dev_type: {
            label: this.$t('compute.text_481'),
            filter: true,
            formatter: val => {
              return `dev_type.contains("${val}")`
            },
          },
          model: {
            label: this.$t('compute.text_482'),
            filter: true,
            formatter: val => {
              return `model.contains("${val}")`
            },
          },
          guest: {
            label: this.$t('compute.text_483', [this.$t('dictionary.server')]),
            filter: true,
            jointFilter: true,
            formatter: val => {
              return `servers.id(guest_id).name.contains("${val}")`
            },
          },
          host: {
            label: this.$t('compute.text_484'),
            filter: true,
            jointFilter: true,
            formatter: val => {
              return `hosts.id(host_id).name.contains("${val}")`
            },
          },
          region: {
            label: this.$t('dictionary.region'),
          },
          zone: {
            label: this.$t('dictionary.zone'),
          },
        },
        steadyStatus: {
          guest_status: [...Object.values(expectStatus.server).flat(), '', undefined],
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('compute.text_228'), key: 'name' },
          { label: this.$t('compute.text_482'), key: 'model' },
          { label: this.$t('compute.text_483', [this.$t('dictionary.server')]), key: 'guest' },
          { label: this.$t('compute.text_484'), key: 'host' },
        ],
      },
      groupActions: [
        {
          label: this.$t('compute.text_485', [this.$t('dictionary.server')]),
          action: () => {
            this.createDialog('DetachGpuDialog', {
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('compute.text_485', [this.$t('dictionary.server')]),
              refresh: this.refresh,
            })
          },
          meta: () => {
            const item = this.list.selectedItems
            if (item.length <= 0) {
              return {
                validate: false,
                tooltip: this.$t('compute.text_486'),
              }
            }
            const validateGuestStatus = item.every(item => item.guest_id && item.guest_status === 'ready')
            const validateGuestId = item.every(item => item.guest_id)
            if (!validateGuestId) {
              return {
                validate: false,
                tooltip: this.$t('compute.text_487', [this.$t('dictionary.server')]),
              }
            }
            if (!validateGuestStatus) {
              return {
                validate: false,
                tooltip: this.$t('compute.text_489', [this.$t('dictionary.server')]),
              }
            }
            return {
              validate: true,
            }
          },
        },
        {
          label: this.$t('compute.text_490'),
          action: () => {
            this.createDialog('SetReserveResourceDialog', {
              onManager: this.onManager,
              data: this.list.selectedItems,
              columns: this.columns,
              refresh: this.refresh,
            })
          },
          meta: () => {
            const item = this.list.selectedItems
            if (item.length <= 0) {
              return {
                validate: false,
                tooltip: this.$t('compute.text_491'),
              }
            }
            return {
              validate: true,
            }
          },
        },
      ],
    }
  },
  created () {
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        show_baremetal_isolated_devices: false,
        ...(R.is(Function, this.getParams) ? this.getParams() : this.getParams),
        with_meta: true,
        details: true,
      }
      return ret
    },
    handleOpenSidepage (row, tab) {
      this.initSidePageTab(tab)
      this.sidePageTriggerHandle(this, 'GpuSidePage', {
        id: row.id,
        resource: 'isolated_devices',
        getParams: this.getParam,
        currentTab: 'servers-list',
      }, {
        list: this.list,
      })
    },
  },
}
</script>
