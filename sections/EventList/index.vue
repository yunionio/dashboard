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
import get from 'lodash/get'
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
        label: this.$t('table.title.res_name'),
      },
      owner_project_ids: {
        label: this.$t('table.title.owner_project'),
      },
      owner_domain_ids: {
        label: this.$t('table.title.owner_domain'),
      },
      user: {
        label: this.$t('table.title.sponsor'),
        filter: true,
        formatter: val => {
          return `user.contains("${val}")`
        },
      },
      action: {
        label: this.$t('table.title.operation'),
        dropdown: true,
        multiple: true,
        distinctField: {
          type: 'field',
          key: 'action',
          getParams: {
            filter: `obj_id.in(${this.objId})`,
          },
        },
        mapper: (data, originData) => {
          const newData = get(originData, '_i18n.action', []).map((item, idx) => {
            return {
              key: originData.action[idx],
              label: item,
            }
          })
          return newData
        },
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
          { label: this.$t('common_56'), key: 'obj_type' },
          { label: this.$t('table.title.operation'), key: 'action' },
          { label: this.$t('table.title.res_name'), key: 'obj_name' },
          { label: this.$t('common.status'), key: 'success' },
          { label: this.$t('common_156'), key: 'start_time' },
          { label: this.$t('table.title.sponsor'), key: 'user' },
          { label: this.$t('table.title.owner_domain'), key: 'owner_domain' },
          { label: this.$t('table.title.owner_project'), key: 'owner_tenant' },
          { label: this.$t('table.title.desc'), key: 'notes' },
        ],
        limit: () => Object.keys(this.list.data).length,
        export: 'custom',
        exportType: {
          custom: { label: this.$t('common_158'), key: 'custom' },
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
          title: this.$t('common_56'),
          field: 'obj_type',
          hideField: true,
          message: row => this.$te(`dictionary.${row.obj_type}`) ? this.$t(`dictionary.${row.obj_type}`) : row.obj_type,
          slotCallback: row => this.$te(`dictionary.${row.obj_type}`) ? this.$t(`dictionary.${row.obj_type}`) : row.obj_type,
        }),
        {
          title: this.$t('table.title.operation'),
          field: '_i18n.action',
          minWidth: 80,
          showOverflow: 'ellipsis',
          slots: {
            default: ({ row }) => {
              const action = get(row, '_i18n.action', row.action)
              return [
                <list-body-cell-wrap copy field='_i18n.action' row={row} hideField={true} message={action}>
                  {action}
                  <a-button
                    type="link"
                    icon="filter"
                    size="small"
                    slot="appendActions"
                    onClick={ () => {
                      this.list.updateFilter({
                        key: 'action',
                        value: [row.action],
                        items: [
                          { key: row.action, label: action },
                        ],
                      })
                    } } />
                </list-body-cell-wrap>,
              ]
            },
          },
        },
        getCopyWithContentTableColumn({
          title: this.$t('table.title.res_name'),
          field: 'obj_name',
        }),
        {
          title: this.$t('common.status'),
          field: 'success',
          width: 80,
          slots: {
            default: ({ row }) => {
              const txt = row.success ? this.$t('common_159') : this.$t('common_160')
              const color = row.success ? '#67C23A' : '#F56C6C'
              return [<span style={{ color }}>{ txt }</span>]
            },
          },
        },
        getTimeTableColumn({
          field: 'start_time',
          title: this.$t('common_156'),
        }),
        {
          field: 'user',
          title: this.$t('table.title.sponsor'),
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
          title: this.$t('table.title.owner_project'),
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
          title: this.$t('table.title.desc'),
          width: 70,
          slots: {
            default: ({ row, column }) => {
              let text = ''
              try {
                text = JSON.stringify(JSON.parse(row.notes), null, 4)
              } catch (e) {
                text = row.notes
              }
              return [<a-button size='small' type='link' onClick={ () => this.clickHandler(text) }>{ this.$t('common.view') }</a-button>]
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
<style lang="less" scoped>
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
