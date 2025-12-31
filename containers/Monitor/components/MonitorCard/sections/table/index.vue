<template>
  <a-skeleton active :loading="loading">
    <div class="table" v-show="showTable">
        <vxe-toolbar v-if="!isTemplate">
          <template #tools>
            <vxe-button @click="exportData" class="icons-list" style="width: 40px;">
              <a-icon type="download" />
            </vxe-button>
          </template>
        </vxe-toolbar>
        <vxe-grid
          v-bind="gridProps"
          size="mini"
          border
          resizable
          ref="overviewTable"
          :columns="columns"
          :scroll-x="{enabled: false}"
          :data="tableRows">
          <template v-slot:empty>
            <loader :loading="loading" :noDataText="$t('common.notData')" />
          </template>
        </vxe-grid>
        <div style="visibility: hidden;height:1px;overflow:hidden;">
          <vxe-grid
            ref="overviewTable2"
            :columns="columns2"
            max-height="1"
            :data="tableRows" />
        </div>
        <div v-if="showTotal" class="vxe-grid--pager-wrapper">
          <div class="vxe-pager size--mini">
            <div class="vxe-pager--wrapper">
              <span class="vxe-pager--total">{{ total }}</span>
            </div>
          </div>
        </div>
    </div>
  </a-skeleton>
</template>

<script>
export default {
  name: 'OverviewTable',
  props: {
    loading: {
      type: Boolean,
      default: false,
    },
    tableData: {
      type: Object,
      default: () => ({}),
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
    fucType: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    showTable () {
      return this.tableData && this.tableData.rows
    },
    total () {
      if (this.showTable) {
        return this.$t('monitor_metric_78', [this.tableData.rows.length])
      }
      return 0
    },
    columns () {
      let cols = (this.tableData?.columns || []).filter(item => !item.onlyExport)
      // isTemplate 时根据 fucType 生成指标列
      if (this.isTemplate && cols.length > 0 && this.fucType && this.fucType.length > 0) {
        // 识别非指标列（name、IP 等固定列）
        const nonMetricFields = ['color', 'name', 'vm_name', 'host', 'rds_name', 'tenant', 'project_domain', 'system', 'brand', 'cloudregion', 'zone', 'external_id', 'id', 'internal_connection_str', 'connection_str', 'all_ip', 'elastic_ip', 'ip', 'raw_name']
        // 找出所有指标列（非固定列）
        const metricColumns = cols.filter(col => !nonMetricFields.includes(col.field))
        // 保留非指标列
        const nonMetricCols = cols.filter(col => nonMetricFields.includes(col.field))

        if (metricColumns.length > 0) {
          const firstMetricColumn = metricColumns[0]
          // 根据 fucType 生成新的指标列
          const newMetricCols = this.fucType.map(fucType => {
            const fucTypeLabel = this.$t(`common.${fucType}`)
            return {
              ...firstMetricColumn,
              field: `${firstMetricColumn.field}_${fucType}`,
              title: `${firstMetricColumn.title} - ${fucTypeLabel}`,
            }
          })
          cols = [...nonMetricCols, ...newMetricCols]
        }
      } else if (this.isTemplate && cols.length > 0) {
        // 如果没有 fucType，保持原有逻辑：只保留第一个指标列
        const nonMetricFields = ['color', 'name', 'vm_name', 'host', 'rds_name', 'tenant', 'project_domain', 'system', 'brand', 'cloudregion', 'zone', 'external_id', 'id', 'internal_connection_str', 'connection_str', 'all_ip', 'elastic_ip', 'ip', 'raw_name']
        const metricColumns = cols.filter(col => !nonMetricFields.includes(col.field))
        if (metricColumns.length > 1) {
          const firstMetricColumn = metricColumns[0]
          cols = cols.filter(col => nonMetricFields.includes(col.field) || col.field === firstMetricColumn.field)
        }
      }
      // 模板模式下，不显示排序按钮
      if (this.isTemplate) {
        return cols.map(col => {
          return {
            ...col,
            sortable: false,
          }
        })
      }
      return cols
    },
    columns2 () {
      let cols = (this.tableData?.columns || []).filter(item => !item.noExport)
      // isTemplate 时根据 fucType 生成指标列
      if (this.isTemplate && cols.length > 0 && this.fucType && this.fucType.length > 0) {
        // 识别非指标列（name、IP 等固定列）
        const nonMetricFields = ['color', 'name', 'vm_name', 'host', 'rds_name', 'tenant', 'project_domain', 'system', 'brand', 'cloudregion', 'zone', 'external_id', 'id', 'internal_connection_str', 'connection_str', 'all_ip', 'elastic_ip', 'ip', 'raw_name']
        // 找出所有指标列（非固定列）
        const metricColumns = cols.filter(col => !nonMetricFields.includes(col.field))
        // 保留非指标列
        const nonMetricCols = cols.filter(col => nonMetricFields.includes(col.field))

        if (metricColumns.length > 0) {
          const firstMetricColumn = metricColumns[0]
          // 根据 fucType 生成新的指标列
          const newMetricCols = this.fucType.map(fucType => {
            const fucTypeLabel = this.$t(`common.${fucType}`)
            return {
              ...firstMetricColumn,
              field: `${firstMetricColumn.field}_${fucType}`,
              title: `${firstMetricColumn.title} - ${fucTypeLabel}`,
            }
          })
          cols = [...nonMetricCols, ...newMetricCols]
        }
      } else if (this.isTemplate && cols.length > 0) {
        // 如果没有 fucType，保持原有逻辑：只保留第一个指标列
        const nonMetricFields = ['color', 'name', 'vm_name', 'host', 'rds_name', 'tenant', 'project_domain', 'system', 'brand', 'cloudregion', 'zone', 'external_id', 'id', 'internal_connection_str', 'connection_str', 'all_ip', 'elastic_ip', 'ip', 'raw_name']
        const metricColumns = cols.filter(col => !nonMetricFields.includes(col.field))
        if (metricColumns.length > 1) {
          const firstMetricColumn = metricColumns[0]
          cols = cols.filter(col => nonMetricFields.includes(col.field) || col.field === firstMetricColumn.field)
        }
      }
      return cols
    },
    gridProps () {
      const ret = {}
      if (!this.isTemplate) {
        ret['max-height'] = this.heightLimit
        ret.class = 'mt-4'
      }
      return ret
    },
    tableRows () {
      if (!this.tableData || !this.tableData.rows) {
        return []
      }
      // toTableData 已经处理了 fucType 的数据，直接返回即可
      return this.tableData.rows
    },
  },
  methods: {
    exportData () {
      this.$refs.overviewTable2.exportData({
        type: 'csv',
      })
    },
  },
}
</script>

<style scoped>
.icons-list >>> .anticon {
  font-size: 16px;
}
</style>
