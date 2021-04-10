<template>
  <div class="event-list">
    <page-list
      :list="list"
      :columns="columns"
      :export-data-options="exportDataOptions"
      :show-group-actions="true"
      :show-page="false"
      :refresh-method="refresh" />
  </div>
</template>

<script>
import {
  getCopyWithContentTableColumn,
  getTimeTableColumn,
  getBrandTableColumn,
} from '@/utils/common/tableColumn'
import { getNameFilter, getBrandFilter } from '@/utils/common/tableFilter'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'CloudeventsList',
  mixins: [WindowsMixin],
  props: {
    id: String,
  },
  data () {
    return {
      list: this.$list.createList(this, {
        id: this.id,
        getParams: this.getParam,
        resource: 'cloudevents',
        apiVersion: 'v1',
        idKey: 'event_id',
        filterOptions: {
          name: getNameFilter({ label: this.$t('cloudenv.text_320') }),
          brand: getBrandFilter(),
          account: {
            label: this.$t('cloudenv.text_498'),
          },
          manager: {
            label: this.$t('cloudenv.text_318'),
          },
          service: {
            label: this.$t('cloudenv.text_321'),
          },
          action: {
            label: this.$t('cloudenv.text_322'),
          },
          created_at: {
            label: this.$t('cloudenv.text_326'),
            dropdown: true,
            date: true,
            filter: true,
            formatter: (val, type) => {
              if (type === 'before') {
                return `created_at.le("${val}")`
              }
              if (type === 'after') {
                return `created_at.ge("${val}")`
              }
              return `created_at.between("${val[0]}", "${val[1]}")`
            },
          },
        },
      }),
      columns: [
        getCopyWithContentTableColumn({
          title: this.$t('cloudenv.text_320'),
          field: 'name',
        }),
        {
          title: this.$t('cloudenv.text_323'),
          field: 'success',
          width: 80,
          slots: {
            default: ({ row }) => {
              const txt = row.success ? this.$t('cloudenv.text_324', ['']) : this.$t('cloudenv.text_325', [''])
              const color = row.success ? '#67C23A' : '#F56C6C'
              return [<span style={{ color }}>{ txt }</span>]
            },
          },
        },
        getCopyWithContentTableColumn({
          title: this.$t('cloudenv.text_321'),
          field: 'service',
        }),
        getCopyWithContentTableColumn({
          title: this.$t('cloudenv.text_322'),
          field: 'logAction',
          hideField: true,
          message: row => row.action,
          slotCallback: (row) => {
            return row.action
          },
        }),
        getBrandTableColumn({
          field: 'provider',
        }),
        getCopyWithContentTableColumn({
          field: 'account',
          title: this.$t('cloudenv.text_498'),
        }),
        getCopyWithContentTableColumn({
          field: 'manager',
          title: this.$t('cloudenv.text_318'),
        }),
        getTimeTableColumn({
          field: 'created_at',
          title: this.$t('cloudenv.text_326'),
        }),
        {
          field: 'notes',
          title: this.$t('table.title.operation'),
          width: 70,
          slots: {
            default: ({ row, column }) => {
              let text = ''
              try {
                text = JSON.stringify(row.request, null, 4)
              } catch (e) {
                text = row.request
              }
              let disabled = false
              if (!row.request) disabled = true
              return [<a-button size='small' type='link' onClick={ () => this.clickHandler(text) } disabled={ disabled }>{ this.$t('common.view') }</a-button>]
            },
          },
        },
      ],
      exportDataOptions: {
        items: [
          // { label: 'ID', key: 'id' },
          { label: this.$t('cloudenv.text_320'), key: 'name' },
          { label: this.$t('cloudenv.text_321'), key: 'service' },
          { label: this.$t('cloudenv.text_322'), key: 'action' },
          { label: this.$t('cloudenv.text_323'), key: 'success' },
          { label: this.$t('cloudenv.text_326'), key: 'created_at' },
          { label: this.$t('cloudenv.text_102'), key: 'provider' },
          { label: this.$t('cloudenv.text_498'), key: 'account' },
          { label: this.$t('cloudenv.text_318'), key: 'manager' },
          // { label: '备注', key: 'notes' },
        ],
        limit: () => Object.keys(this.list.data).length,
        export: 'custom',
        notCombineListParams: true,
        exportType: {
          custom: { label: this.$t('cloudenv.text_328'), key: 'custom' },
        },
      },
    }
  },
  created () {
    this.initSidePageTab('cloudregion-detail')
    this.list.fetchData()
  },
  methods: {
    clickHandler (val) {
      this.createDialog('EventLogDialog', {
        data: val,
      })
    },
    refresh (clearSelected) {
      clearSelected()
      this.list.reset()
      this.list.fetchData()
    },
  },
}
</script>
