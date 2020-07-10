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
          name: getNameFilter(),
          brand: getBrandFilter(),
          account: {
            label: '账号',
          },
          manager: {
            label: '订阅',
          },
          service: {
            label: '服务类型',
          },
          action: {
            label: '操作类型',
          },
        },
      }),
      columns: [
        getCopyWithContentTableColumn({
          title: '资源名称',
          field: 'name',
        }),
        getCopyWithContentTableColumn({
          title: '服务类型',
          field: 'service',
        }),
        getCopyWithContentTableColumn({
          title: '操作类型',
          field: 'action',
        }),
        {
          title: '执行状态',
          field: 'success',
          width: 80,
          slots: {
            default: ({ row }) => {
              const txt = row.success ? '成功' : '失败'
              const color = row.success ? '#67C23A' : '#F56C6C'
              return [<span style={{ color }}>{ txt }</span>]
            },
          },
        },
        getTimeTableColumn({
          field: 'created_at',
          title: '操作时间',
        }),
        getBrandTableColumn({
          field: 'provider',
        }),
        getCopyWithContentTableColumn({
          field: 'account',
          title: '账号',
        }),
        getCopyWithContentTableColumn({
          field: 'manager',
          title: '订阅',
        }),
        {
          field: 'notes',
          title: '备注',
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
              return [<a-button size='small' type='link' onClick={ () => this.clickHandler(text) } disabled={ disabled }>查看</a-button>]
            },
          },
        },
      ],
      exportDataOptions: {
        items: [
          // { label: 'ID', key: 'id' },
          { label: '资源名称', key: 'name' },
          { label: '服务类型', key: 'service' },
          { label: '操作类型', key: 'action' },
          { label: '执行状态', key: 'success' },
          { label: '操作时间', key: 'created_at' },
          { label: '平台', key: 'provider' },
          { label: '账号', key: 'account' },
          { label: '订阅', key: 'manager' },
          // { label: '备注', key: 'notes' },
        ],
        limit: () => Object.keys(this.list.data).length,
        export: 'custom',
        exportType: {
          custom: { label: '本页显示日志', key: 'custom' },
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
