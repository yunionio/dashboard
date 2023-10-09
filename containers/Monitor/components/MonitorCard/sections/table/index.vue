<template>
  <a-skeleton active :loading="loading">
    <div class="table" v-show="showTable">
        <vxe-toolbar>
          <template #tools>
            <vxe-button @click="exportData" class="icons-list" style="width: 40px;">
              <a-icon type="download" />
            </vxe-button>
          </template>
        </vxe-toolbar>
        <vxe-grid
          class="mt-4"
          size="mini"
          border
          resizable
          ref="overviewTable"
          :columns="columns"
          max-height="400"
          :scroll-x="{enabled: false}"
          :data="tableData.rows">
          <template v-slot:empty>
            <loader :loading="loading" :noDataText="$t('common.notData')" />
          </template>
        </vxe-grid>
        <div style="visibility: hidden;height:1px;overflow:hidden;">
          <vxe-grid
            ref="overviewTable2"
            :columns="columns2"
            max-height="1"
            :data="tableData.rows" />
        </div>
        <div class="vxe-grid--pager-wrapper">
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
      return (this.tableData?.columns || []).filter(item => !item.onlyExport)
    },
    columns2 () {
      return (this.tableData?.columns || []).filter(item => !item.noExport)
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
