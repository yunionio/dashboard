<template>
  <floating-scroll>
    <vxe-grid
      highlight-hover-row
      highlight-current-row
      class="page-list-grid"
      ref="grid"
      align="left"
      :data="tableData"
      :row-id="idKey"
      :columns="tableColumns"
      :style="gridStyle"
      :sort-config="{ sortMethod: () => {} }"
      :checkbox-config="{ reserve: true, highlight: true }"
      :expand-config="expandConfig"
      :pager-config="tablePage"
      @page-change="handlePageChange"
      @sort-change="handleSortChange"
      @checkbox-change="handleCheckboxChange"
      @checkbox-all="handleCheckboxChange">
      <template v-slot:empty>
        <loader :loading="loading" />
      </template>
    </vxe-grid>
    <template v-if="tableData.length > 0 && nextMarker">
      <div class="text-center mt-4">
        <a-button :loading="loading" type="link" @click="handleNextMarkerChange">{{ loading ? this.$t('common.loding') : this.$t('common.LoadMore') }}</a-button>
      </div>
    </template>
  </floating-scroll>
</template>

<script>
import * as R from 'ramda'
import Actions from '../Actions'
import { addResizeListener, removeResizeListener } from '@/utils/resizeEvent'
import { getTagTitle } from '@/utils/common/tag'

export default {
  name: 'PageListTable',
  props: {
    idKey: String,
    data: {
      type: Object,
      required: true,
    },
    // 列配置
    columns: {
      type: Array,
      required: true,
    },
    loading: Boolean,
    // 是否显示列选择
    showCheckbox: Boolean,
    groupActions: Array,
    // 单行操作配置
    singleActions: Array,
    showSingleActions: {
      type: Boolean,
      default: true,
    },
    getLimit: {
      type: Function,
      required: true,
    },
    offset: {
      type: Number,
      required: true,
    },
    total: {
      type: Number,
      required: true,
    },
    limit: {
      type: Number,
      required: true,
    },
    pagerLayout: Array,
    // 展开行配置项
    expandConfig: Object,
    config: Object,
    nextMarker: String,
  },
  data () {
    return {
      // table width
      tableWidth: 'auto',
      tableColumns: [],
      finalLimit: this.getLimit(),
    }
  },
  computed: {
    // 是否渲染
    _showCheckbox () {
      return (this.groupActions && this.groupActions.length > 0) || this.showCheckbox
    },
    gridStyle () {
      return {
        width: `${this.tableWidth}px`,
      }
    },
    tableData (val, oldVal) {
      return Object.values(this.data).sort((a, b) => a.index - b.index).map(item => item.data)
    },
    tablePage () {
      if (this.total <= 0) return null
      const currentPage = this.finalLimit ? Math.floor(this.offset / this.finalLimit) + 1 : 1
      return {
        total: this.total,
        currentPage,
        pageSize: this.finalLimit,
        layouts: this.pagerLayout,
      }
    },
  },
  watch: {
    columns: {
      handler (val, oldVal) {
        if (!R.equals(val, oldVal)) {
          this.$nextTick(() => {
            this.tableColumns = this.genTableColumns()
          })
        }
      },
      immediate: true,
    },
    limit (val, oldVal) {
      this.finalLimit = this.getLimit()
    },
    'config.hiddenColumns' (val, oldVal) {
      if (!R.equals(val, oldVal)) {
        this.$nextTick(() => {
          this.tableColumns = this.genTableColumns()
        })
      }
    },
    'config.showTagKeys' (val, oldVal) {
      if (!R.equals(val, oldVal)) {
        this.$nextTick(() => {
          this.tableColumns = this.genTableColumns()
        })
      }
    },
  },
  mounted () {
    this.initFloatingScrollListener()
  },
  methods: {
    // 初始化tbody监听器，发生变化更新虚拟滚动条，以保证宽度是正确的
    initFloatingScrollListener () {
      const gridEl = this.$refs.grid.$el
      const tableBodyEl = gridEl.querySelector('.vxe-table--body-wrapper .vxe-table--body')
      addResizeListener(tableBodyEl, this.updateFloatingScroll)
      this.$once('hook:beforeDestroy', () => {
        removeResizeListener(tableBodyEl, this.updateFloatingScroll)
      })
    },
    // 更新虚拟滚动条
    updateFloatingScroll () {
      const gridEl = this.$refs.grid && this.$refs.grid.$el
      if (!gridEl) return
      const tableBodyEl = gridEl.querySelector('.vxe-table--body-wrapper .vxe-table--body')
      const tableBodyWidth = tableBodyEl.getBoundingClientRect().width
      if (tableBodyWidth) this.tableWidth = tableBodyWidth
      gridEl && this.$bus.$emit('FloatingScrollUpdate', {
        sourceElement: gridEl,
      })
    },
    // 生成 table columns
    genTableColumns () {
      let defaultColumns = this.columns.filter(item => {
        if (R.is(Function, item.hidden)) return !item.hidden()
        return !item.hidden
      })
      if (this._showCheckbox) {
        defaultColumns.unshift({ type: 'checkbox', width: 40 })
      }
      if (this.showSingleActions && this.singleActions && this.singleActions.length) {
        defaultColumns.push({
          field: 'action',
          title: this.$t('common.action'),
          minWidth: 120,
          slots: {
            default: ({ row }, h) => {
              return [
                this.$createElement(Actions, {
                  props: {
                    options: this.singleActions,
                    row,
                    buttonType: 'link',
                    buttonSize: 'small',
                    buttonStyle: {
                      fontSize: '12px',
                    },
                  },
                }),
              ]
            },
            header: ({ column }, h) => {
              return [
                this.$createElement('span', {
                  style: {
                    paddingLeft: '7px',
                  },
                }, this.$t('common.action')),
              ]
            },
          },
        })
      }
      if (this.config && this.config.hiddenColumns) {
        R.forEach(item => {
          if (item.type !== 'checkbox' || item.field !== 'action') {
            item.visible = !this.config.hiddenColumns.includes(item.field)
          }
        }, defaultColumns)
      }
      if (this.config && this.config.showTagKeys && this.config.showTagKeys.length) {
        const tagColumns = this.config.showTagKeys.map(item => {
          return {
            field: item,
            title: getTagTitle(item),
            showOverflow: 'title',
            minWidth: 100,
            sortable: true,
            slots: {
              default: ({ row }) => {
                const message = row.metadata && row.metadata[item]
                return [
                  this.$createElement('list-body-cell-wrap', {
                    props: {
                      copy: true,
                      field: item,
                      row,
                      message,
                      hideField: true,
                    },
                  }, message),
                ]
              },
            },
          }
        })
        const insertIndex = this._showCheckbox ? 2 : 1
        defaultColumns = R.insertAll(insertIndex, tagColumns, defaultColumns)
      }
      return defaultColumns
    },
    handlePageChange ({ type, currentPage, pageSize }) {
      if (type === 'current') {
        this.$emit('change-current-page', currentPage)
        this.$emit('clear-selected')
      }
      if (type === 'size') {
        this.$emit('change-page-size', pageSize)
      }
    },
    handleSortChange ({ property, order }) {
      this.$emit('clear-selected')
      this.$emit('do-sort', property, order)
    },
    handleCheckboxChange ({ selection }) {
      this.$emit('change-selected', selection)
    },
    clearCheckbox () {
      this.$refs.grid.clearCheckboxReserve()
      this.$refs.grid.clearCheckboxRow()
    },
    handleNextMarkerChange () {
      this.$emit('change-next-marker')
    },
  },
}
</script>

<style lang="scss" scoped>
.page-list-grid {
  min-width: 100%;
  ::v-deep {
    > .vxe-table > .vxe-table--main-wrapper > .vxe-table--body-wrapper {
      overflow: hidden;
    }
    .vxe-table.is--empty .vxe-table--empty-block, .vxe-table.is--empty .vxe-table--empty-placeholder {
      height: auto !important;
    }
  }
}
</style>
