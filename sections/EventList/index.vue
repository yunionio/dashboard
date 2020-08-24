<template>
  <div class="event-list">
    <page-list
      default-search-key="obj_name"
      :list="list"
      :columns="columns"
      :export-data-options="exportDataOptions"
      :show-page="false"
      :refresh-method="refresh" />
     <div class="mb-3 search-date">
        <a-range-picker
          style="width: 370px;"
          class="mr-2"
          v-model="rangeTime"
          format="YYYY-MM-DD HH:mm:ss"
          :show-time="{ defaultValue: [$moment('00:00:00', 'HH:mm:ss'), $moment('23:59:59', 'HH:mm:ss')] }"
          @change="handleRangeTimeChange" />
    </div>
  </div>
</template>

<script>
import {
  getCopyWithContentTableColumn,
  getTimeTableColumn,
} from '@/utils/common/tableColumn'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'EventList',
  mixins: [WindowsMixin],
  props: {
    objId: {
      type: String,
    },
    objType: {
      type: String,
    },
  },
  data () {
    const filterOptions = {
      obj_name: {
        label: '资源名称',
      },
      owner_project_ids: {
        label: `所属${this.$t('dictionary.project')}`,
      },
      owner_domain_ids: {
        label: `所属${this.$t('dictionary.domain')}`,
      },
      user: {
        label: '发起人',
        filter: true,
        formatter: val => {
          return `user.contains("${val}")`
        },
      },
      action: {
        label: '操作',
      },
    }
    if (this.$store.getters.isProjectMode) delete filterOptions.tenant
    return {
      rangeTime: [null, null],
      list: this.$list.createList(this, {
        resource: 'actions',
        apiVersion: 'v1',
        getParams: this.getParam,
        filterOptions,
      }),
      exportDataOptions: {
        items: [
          { label: 'ID', key: 'id' },
          { label: '类型', key: 'obj_type' },
          { label: '操作', key: 'action' },
          { label: '资源名称', key: 'obj_name' },
          { label: '执行状态', key: 'success' },
          { label: '操作时间', key: 'start_time' },
          { label: '发起人', key: 'user' },
          { label: `所属${this.$t('dictionary.domain')}`, key: 'owner_domain' },
          { label: `所属${this.$t('dictionary.project')}`, key: 'owner_tenant' },
          { label: '备注', key: 'notes' },
        ],
        limit: () => Object.keys(this.list.data).length,
        export: 'custom',
        exportType: {
          custom: { label: '本页显示日志', key: 'custom' },
        },
      },
      columns: [
        {
          title: '#',
          field: 'id',
          minWidth: 80,
          showOverflow: 'ellipsis',
        },
        getCopyWithContentTableColumn({
          title: '类型',
          field: 'obj_type',
          hideField: true,
          slotCallback: row => this.$te(`dictionary.${row.obj_type}`) ? this.$t(`dictionary.${row.obj_type}`) : row.obj_type,
        }),
        getCopyWithContentTableColumn({
          title: '操作',
          field: 'action',
        }),
        getCopyWithContentTableColumn({
          title: '资源名称',
          field: 'obj_name',
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
          field: 'start_time',
          title: '操作时间',
        }),
        {
          field: 'user',
          title: '发起人',
          showOverflow: 'title',
          minWidth: 120,
          slots: {
            default: ({ row }, h) => {
              const domain = row.project_domain
              const tenant = row.tenant
              const ret = [
                <list-body-cell-wrap style="margin: 3px 0 2px 0" copy field='user' row={row} />,
                <list-body-cell-wrap style="line-height: 1" hide-field copy field="tenant" row={{ tenant }}>
                  <span class='text-weak'>{ tenant }</span>
                </list-body-cell-wrap>,
                <list-body-cell-wrap style="margin-bottom: 3px" hide-field copy field="domain" row={{ domain }}>
                  <span class='text-weak'>{ domain }</span>
                </list-body-cell-wrap>,
              ]
              return ret
            },
          },
        },
        {
          field: 'owner_tenant',
          title: `所属${this.$t('dictionary.project')}`,
          showOverflow: 'title',
          minWidth: 120,
          slots: {
            default: ({ row }, h) => {
              const domain = row.owner_domain
              const ret = [
                <list-body-cell-wrap copy field='owner_tenant' row={row} />,
                <list-body-cell-wrap hide-field copy field="domain" row={{ domain }}>
                  <span class='text-weak'>{ domain }</span>
                </list-body-cell-wrap>,
              ]
              return ret
            },
          },
        },
        {
          field: 'notes',
          title: '备注',
          width: 70,
          slots: {
            default: ({ row, column }) => {
              let text = ''
              try {
                text = JSON.stringify(JSON.parse(row.notes), null, 4)
              } catch (e) {
                text = row.notes
              }
              return [<a-button size='small' type='link' onClick={ () => this.clickHandler(text) }>查看</a-button>]
            },
          },
        },
      ],
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
      const filter = []
      if (this.objId) {
        filter.push([`obj_id.in('${this.objId}')`])
      }
      if (this.objType) {
        param.obj_type = this.objType
      }
      if (this.rangeTime[0] && this.rangeTime[1]) {
        filter.push(`start_time.between('${this.$moment.utc(this.rangeTime[0]).format()}', '${this.$moment.utc(this.rangeTime[1]).format()}')`)
      }
      param.filter = filter
      return param
    },
    handleRangeTimeChange () {
      this.list.reset()
      this.list.fetchData()
    },
    refresh (clearSelected) {
      clearSelected()
      this.list.reset()
      this.list.fetchData()
    },
  },
}
</script>
<style lang="scss" scoped>
  .event-list{
    position: relative;
    padding-bottom: 20px;
    .search-date {
      position: absolute;
      right: 50px;
      top: 0;
    }
  }
</style>
