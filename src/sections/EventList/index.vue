<template>
  <div class="event-list">
    <page-list
      :list="list"
      :columns="columns"
      :export-data-options="exportDataOptions"
      :show-page="false"
      :refresh-method="refresh"
      :enable-virtual-scroll="enableVirtualScroll"
      default-search-key="obj_name"
      :single-actions="singleActions" />
  </div>
</template>

<script>
import * as R from 'ramda'
import get from 'lodash/get'
import { getTimeRangeFilter } from '@/utils/common/tableFilter'
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
    listId: {
      type: String,
    },
    enableVirtualScroll: {
      type: Boolean,
      default: false,
    },
    getParams: [Object, Function],
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
        label: this.$t('common.operation_type'),
        dropdown: true,
        multiple: true,
        distinctField: {
          type: 'field',
          key: 'action',
          // getParams: () => {
          //   return this.objId && {
          //     filter: `obj_id.in(${this.objId})`,
          //   }
          // },
        },
        mapper: (data, originData) => {
          const i18n = originData._i18n.action
          const keys = originData.action

          const obj = {}

          for (let i = 0, len = i18n.length; i < len; i++) {
            const label = i18n[i]
            const key = keys[i]
            if (obj[label]) {
              obj[label].push(key)
            } else {
              obj[label] = [key]
            }
          }
          return Object.keys(obj).filter(item => !!item).map((item) => ({ label: item, key: obj[item].join(',') }))
        },
      },
      severity: {
        label: this.$t('common_log_table_key.severity'),
        dropdown: true,
        multiple: true,
        distinctField: {
          type: 'field',
          key: 'severity',
        },
      },
      kind: {
        label: this.$t('common_log_table_key.kind'),
        dropdown: true,
        multiple: true,
        distinctField: {
          type: 'field',
          key: 'kind',
        },
      },
      service: {
        label: this.$t('table.title.service'),
        dropdown: true,
        multiple: true,
        distinctField: {
          type: 'field',
          key: 'service',
          // getParams: () => {
          //   return this.objId && {
          //     filter: `obj_id.in(${this.objId})`,
          //   }
          // },
        },
        mapper: (data, originData) => {
          const i18n = originData._i18n.service
          const keys = originData.service

          const obj = {}

          for (let i = 0, len = i18n.length; i < len; i++) {
            const label = i18n[i]
            const key = keys[i]
            if (obj[label]) {
              obj[label].push(key)
            } else {
              obj[label] = [key]
            }
          }
          return Object.keys(obj).filter(item => !!item).map((item) => ({ label: item, key: obj[item].join(',') }))
        },
      },
      obj_type: {
        label: this.$t('table.title.obj_type'),
        dropdown: true,
        multiple: true,
        distinctField: {
          type: 'field',
          key: 'obj_type',
          // getParams: () => {
          //   return this.objId && {
          //     filter: `obj_id.in(${this.objId})`,
          //   }
          // },
        },
        mapper: (data, originData) => {
          const i18n = originData._i18n.obj_type
          const keys = originData.obj_type

          const obj = {}

          for (let i = 0, len = i18n.length; i < len; i++) {
            const label = i18n[i]
            const key = keys[i]
            if (obj[label]) {
              obj[label].push(key)
            } else {
              obj[label] = [key]
            }
          }
          return Object.keys(obj).filter(item => !!item).map((item) => ({ label: item, key: obj[item].join(',') }))
        },
      },
      success: {
        label: this.$t('table.title.action_result'),
        dropdown: true,
        items: [
          { label: this.$t('operation.success.true'), key: true },
          { label: this.$t('operation.success.false'), key: false },
        ],
      },
      start_time: getTimeRangeFilter({ label: this.$t('common_156'), field: 'start_time' }),
    }
    if (this.$store.getters.isProjectMode) delete filterOptions.tenant
    return {
      list: this.$list.createList(this, {
        id: this.listId,
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
          { label: this.$t('common_log_table_key.severity'), key: 'severity' },
          { label: this.$t('common_log_table_key.kind'), key: 'kind' },
          { label: this.$t('common.status'), key: 'success' },
          { label: this.$t('common_156'), key: 'start_time' },
          { label: this.$t('table.title.sponsor'), key: 'user' },
          { label: this.$t('table.title.owner_domain'), key: 'owner_domain' },
          { label: this.$t('table.title.owner_project'), key: 'owner_tenant' },
          { label: this.$t('table.title.desc'), key: 'notes' },
        ],
        limit: () => Object.keys(this.list.data).length,
        export: 'custom',
        notCombineListParams: true,
        exportType: {
          custom: { label: this.$t('common_158'), key: 'custom' },
          allFilter: { label: this.$t('common_96'), key: 'allFilter' },
        },
        getParams: ({ exportType }) => {
          let params = {
            scope: this.$store.getters.scope,
          }
          if (exportType === 'allFilter') {
            params = {
              scope: this.$store.getters.scope,
              filter: this.list.params.filter,
              export_limit: 0,
            }
          }
          return params
        },
      },
      columns: [
        {
          title: '#ID',
          field: 'id',
          minWidth: 80,
          showOverflow: 'ellipsis',
        },
        getTimeTableColumn({
          field: 'start_time',
          title: this.$t('common_156'),
        }),
        getCopyWithContentTableColumn({
          title: this.$t('table.title.res_name'),
          field: 'obj_name',
        }),
        getCopyWithContentTableColumn({
          title: this.$t('scope.text_653'),
          field: 'obj_type',
          hideField: true,
          message: row => {
            const { _i18n = {} } = row
            return _i18n.obj_type || (this.$te(`dictionary.${row.obj_type}`) ? this.$t(`dictionary.${row.obj_type}`) : row.obj_type)
          },
          slotCallback: row => {
            const { _i18n = {} } = row
            return _i18n.obj_type || (this.$te(`dictionary.${row.obj_type}`) ? this.$t(`dictionary.${row.obj_type}`) : row.obj_type)
          },
        }),
        {
          title: this.$t('common.operation_type'),
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
          title: this.$t('common_log_table_key.severity'),
          field: 'severity',
        }),
        getCopyWithContentTableColumn({
          title: this.$t('common_log_table_key.kind'),
          field: 'kind',
        }),
        {
          title: this.$t('table.title.action_result'),
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
        {
          field: 'user',
          title: this.$t('table.title.sponsor'),
          minWidth: 120,
          slots: {
            default: ({ row }, h) => {
              const domain = row.project_domain
              const tenant = row.tenant
              const ret = [
                <list-body-cell-wrap style="margin: 3px 0 2px 0" copy field='user' row={row} />,
                <div>
                  <span class='text-weak' title={ this.$t('shareScope.domain') }> { domain } </span>
                  <span class='text-weak' title={ this.$t('shareScope.project') }> { tenant } </span>
                </div>,
                <list-body-cell-wrap style="margin: 3px 0 2px 0" copy field='ip' row={row} />,
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
    }
  },
  watch: {
    getParams (val) {
      if (!R.is(Function, this.getParams)) {
        this.list.reset()
        this.list.fetchData()
      }
    },
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
        // filter.push([`obj_id.in('${this.objId}')`])
        param.obj_id = this.objId
      }
      if (this.objType) {
        param.obj_type = this.objType
      }
      param.filter = filter
      const params = R.is(Function, this.getParams) ? this.getParams() : this.getParams || {}
      return { ...param, ...params }
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
}
</style>
