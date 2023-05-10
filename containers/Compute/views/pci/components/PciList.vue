<template>
  <page-list
    :list="list"
    :columns="columns"
    :group-actions="groupActions"
    :single-actions="singleActions"
    :export-data-options="exportDataOptions" />
</template>

<script>
import WindowsMixin from '@/mixins/windows'
import ListMixin from '@/mixins/list'
import ColumnsMixin from '../mixins/columns'
import SingleActionsMixin from '../mixins/singleActions'

export default {
  name: 'PciList',
  mixins: [WindowsMixin, ListMixin, ColumnsMixin, SingleActionsMixin],
  data () {
    return {
      list: this.$list.createList(this, {
        id: 'pciList',
        resource: 'isolated_device_models',
        getParams: this.getParam,
        filterOptions: {
          dev_type: {
            label: this.$t('compute.pci.dev_type'),
            filter: true,
            formatter: val => {
              return `dev_type.contains("${val}")`
            },
          },
          model: {
            label: this.$t('compute.pci.model'),
            filter: true,
            formatter: val => {
              return `model.contains("${val}")`
            },
          },
          vendor_id: {
            label: this.$t('compute.pci.vendor_id'),
            filter: true,
            formatter: val => {
              return `vendor_id.contains("${val}")`
            },
          },
          device_id: {
            label: this.$t('compute.pci.device_id'),
            filter: true,
            formatter: val => {
              return `device_id.contains("${val}")`
            },
          },
        },
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: this.$t('compute.pci.dev_type'), key: 'dev_type' },
          { label: this.$t('compute.pci.model'), key: 'model' },
          { label: this.$t('compute.pci.vendor_id'), key: 'vendor_id' },
          { label: this.$t('compute.pci.device_id'), key: 'device_id' },
        ],
      },
      columns: [],
      groupActions: [
        {
          label: this.$t('common.create'),
          action: () => {
            this.createDialog('PciCreateDialog', {
              refresh: this.refresh,
            })
          },
          meta: () => ({
            buttonType: 'primary',
          }),
        },
        {
          label: this.$t('table.action.delete'),
          action: () => {
            this.createDialog('DeleteResDialog', {
              vm: this,
              data: this.list.selectedItems,
              columns: this.columns,
              title: this.$t('table.action.delete'),
              name: this.$t('compute.pci.passthrough_device_type'),
              onManager: this.onManager,
            })
          },
          meta: () => {
            const ret = { validate: this.list.selected.length }
            if (this.list.selectedItems.some(item => !item.can_delete)) {
              ret.validate = false
              return ret
            }
            return ret
          },
        },
      ],
    }
  },
  created () {
    this.initSidePageTab('pci-detail')
    this.list.fetchData()
  },
  methods: {
    getParam () {
      const ret = {
        with_meta: true,
        details: true,
      }
      return ret
    },
    handleOpenSidepage (row, tab) {
      this.sidePageTriggerHandle(this, 'PciSidePage', {
        id: row.id,
        resource: 'isolated_device_models',
        getParams: this.getParam,
      }, {
        list: this.list,
        tab,
      })
    },
  },
}
</script>

<style>

</style>
