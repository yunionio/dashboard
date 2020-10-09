<template>
  <div class="event-list">
    <page-list
      :list="list"
      :columns="columns"
      :export-data-options="exportDataOptions"
      :show-group-actions="true"
      :show-page="false"
      :refresh-method="refresh">
      <template v-slot:right-tools-prepend>
        <a-range-picker
          style="width: 370px;"
          class="mr-2"
          v-model="rangeTime"
          format="YYYY-MM-DD HH:mm:ss"
          :show-time="{ defaultValue: [$moment('00:00:00', 'HH:mm:ss'), $moment('23:59:59', 'HH:mm:ss')] }"
          @change="handleRangeTimeChange" />
      </template>
    </page-list>
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
      rangeTime: [null, null],
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
            label: this.$t('cloudenv.text_94'),
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
        },
      }),
      columns: [
        getCopyWithContentTableColumn({
          title: this.$t('cloudenv.text_320'),
          field: 'name',
        }),
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
        {
          title: this.$t('cloudenv.text_323'),
          field: 'success',
          width: 80,
          slots: {
            default: ({ row }) => {
              const txt = row.success ? this.$t('cloudenv.text_324') : this.$t('cloudenv.text_325')
              const color = row.success ? '#67C23A' : '#F56C6C'
              return [<span style={{ color }}>{ txt }</span>]
            },
          },
        },
        getTimeTableColumn({
          field: 'created_at',
          title: this.$t('cloudenv.text_326'),
        }),
        getBrandTableColumn({
          field: 'provider',
        }),
        getCopyWithContentTableColumn({
          field: 'account',
          title: this.$t('cloudenv.text_94'),
        }),
        getCopyWithContentTableColumn({
          field: 'manager',
          title: this.$t('cloudenv.text_318'),
        }),
        {
          field: 'notes',
          title: this.$t('cloudenv.text_327'),
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
          { label: this.$t('cloudenv.text_94'), key: 'account' },
          { label: this.$t('cloudenv.text_318'), key: 'manager' },
          // { label: '备注', key: 'notes' },
        ],
        limit: () => Object.keys(this.list.data).length,
        export: 'custom',
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
    getParam () {
      const param = {}
      if (this.rangeTime[0] && this.rangeTime[1]) {
        param.filter = `created_at.between('${this.$moment.utc(this.rangeTime[0]).format()}', '${this.$moment.utc(this.rangeTime[1]).format()}')`
      } else {
        delete param.filter
      }
      return param
    },
    refresh (clearSelected) {
      clearSelected()
      this.list.reset()
      this.list.fetchData()
    },
    handleRangeTimeChange () {
      this.list.reset()
      this.list.fetchData()
    },
  },
}
</script>
<style lang="less" scoped>
  .event-list{
    position: relative;
    .search-date {
      position: absolute;
      right: 0;
      top: 0;
    }
  }
</style>
