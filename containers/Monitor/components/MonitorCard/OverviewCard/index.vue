<template>
  <overview-card-layout :card_style="isTemplate ? 'no-border' : ''">
    <template #header>
      <div :class="{ 'position-hidden': isTemplate && !isTemplateEdit}">
        <filter-form
          ref="filterForm"
          :is-template="isTemplate"
          :is-template-edit="isTemplateEdit"
          :template-params="templateParams"
          :scopeParams="scopeParams"
          @updateTable="handleUpdateTable"
          @updateChart="handleUpdateChart"
          @changeNav="handleChangeNav"
          @dataLoading="handleOnDataLoading"
          @showTable="handleShowTable"
          @changeLimit="handleChangeLimit"
          @updateFucType="handleUpdateFucType"
          :scope="scope"
          :extraParams="extraParams" />
      </div>
    </template>
     <component v-if="chart.chartType && limit && !isTemplate" :is="chart.chartType" :chartData="chart.chartData" :yAxisFormat="chart.metric.format" :loading="chart.loading || tableLoading" id="monitor-overview-resource" :exportName="exportName" />
    <template #footer>
      <overview-table :table-data="table" :loading="tableLoading" v-if="showTable" :is-template="isTemplate" :fuc-type="fucType" />
    </template>
  </overview-card-layout>
</template>

<script>
import OverviewCardLayout from '../layout'
import OverviewLine from '../sections/chart/line'
import OverviewHistogram from '../sections/chart/histogram'
import OverviewRing from '../sections/chart/ring'
import OverviewTable from '../sections/table'
import filterForm from './filterForm'

export default {
  name: 'index',
  components: {
    OverviewCardLayout,
    filterForm,
    OverviewLine,
    OverviewHistogram,
    OverviewRing,
    OverviewTable,
  },
  props: {
    scope: {
      type: String,
      required: true,
    },
    extraParams: {
      type: Object,
      required: false,
      default: () => ({}),
    },
    isTemplate: {
      type: Boolean,
      default: false,
    },
    isTemplateEdit: {
      type: Boolean,
      default: false,
    },
    templateParams: {
      type: Object,
      default: () => ({}),
    },
    scopeParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      chart: { loading: true },
      table: {},
      showTable: false,
      tableLoading: false,
      limit: this.templateParams?.limit || 10,
      fucType: this.templateParams?.fucType || [],
    }
  },
  computed: {
    exportName () {
      return this.chart.metric?.label || 'Export'
    },
  },
  methods: {
    handleShowTable (v) {
      this.showTable = v
    },
    handleOnDataLoading (v) {
      this.tableLoading = v
    },
    handleUpdateTable (v) {
      this.table = v
    },
    handleUpdateChart (v) {
      this.chart = v
    },
    handleChangeNav (v) {
      this.$emit('changeNav', v)
    },
    handleChangeLimit (v) {
      this.limit = v || 0
    },
    handleUpdateFucType (v) {
      this.fucType = v || []
    },
    // 导出作为报表模板时参数
    getTemplateParams () {
      return {
        fucType: this.fucType,
        measurement: this.metric?.measurement || this.chart?.metric?.measurement,
        field: this.metric?.field || this.chart?.metric?.field,
        limit: this.limit,
        from: this.$refs.filterForm.from,
      }
    },
  },
}
</script>

<style lang="less" scoped>
.position-hidden {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
}
</style>
