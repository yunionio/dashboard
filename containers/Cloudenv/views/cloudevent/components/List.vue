<template>
  <div class="event-list">
    <page-list
      :list="list"
      :columns="columns"
      :export-data-options="exportDataOptions"
      :show-group-actions="true"
      :show-page="false"
      :refresh-method="refresh"
      :single-actions="singleActions" />
  </div>
</template>

<script>
import get from 'lodash/get'
import {
  getCopyWithContentTableColumn,
  getTimeTableColumn,
  getBrandTableColumn,
} from '@/utils/common/tableColumn'
import { getNameFilter, distinctFieldFilter, getSuccessFilter, getTimeRangeFilter } from '@/utils/common/tableFilter'
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
          created_at: getTimeRangeFilter({ label: this.$t('cloudenv.text_326'), field: 'created_at' }),
          name: getNameFilter({ label: this.$t('cloudenv.text_320') }),
          provider: distinctFieldFilter({ service: 'cloudevent', field: 'provider' }),
          account: distinctFieldFilter({ service: 'cloudevent', field: 'account' }),
          action: distinctFieldFilter({ service: 'cloudevent', field: 'action' }),
          service: distinctFieldFilter({ service: 'cloudevent', field: 'service' }),
          resource_type: distinctFieldFilter({ service: 'cloudevent', field: 'resource_type' }),
          success: getSuccessFilter(),
          manager: distinctFieldFilter({ service: 'cloudevent', field: 'manager' }),
        },
      }),
      columns: [
        getTimeTableColumn({
          field: 'created_at',
          title: this.$t('cloudenv.text_326'),
        }),
        getBrandTableColumn({
          field: 'provider',
        }),
        getCopyWithContentTableColumn({
          field: 'account',
          title: this.$t('cloudenv.text_498'),
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
        getCopyWithContentTableColumn({
          title: this.$t('cloudenv.Service'),
          field: 'service',
        }),
        getCopyWithContentTableColumn({
          title: this.$t('cloudenv.text_321'),
          field: 'resource_type',
        }),
        getCopyWithContentTableColumn({
          title: this.$t('cloudenv.text_320'),
          field: 'name',
          hideField: true,
          slotCallback: (row) => {
            const resource_name = get(row, 'request.resource_name')
            return resource_name || row.name
          },
          message: (row) => {
            const resource_name = get(row, 'request.resource_name')
            return resource_name || row.name
          },
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
          field: 'manager',
          title: this.$t('cloudenv.text_318'),
        }),
      ],
      singleActions: [{
        label: this.$t('common.view'),
        action: row => {
          let text = ''
          try {
            text = JSON.stringify(JSON.parse(row.notes), null, 4)
          } catch (e) {
            text = row.notes
          }
          this.clickHandler(text)
        },
      }],
      exportDataOptions: {
        items: [
          // { label: 'ID', key: 'id' },
          { label: this.$t('cloudenv.text_320'), key: 'name' },
          { label: this.$t('cloudenv.Service'), key: 'service' },
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
