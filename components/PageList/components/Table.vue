<template>
  <floating-scroll :hiddenScrollbar="hiddenScrollbar" unobtrusive>
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
      :expand-config="expandConfig"
      :pager-config="tablePage"
      :span-method="spanMethod"
      @page-change="handlePageChange"
      @sort-change="handleSortChange"
      v-on="dynamicEvents"
      v-bind="dynamicProps">
      <template v-slot:empty>
        <loader :loading="loading" :noDataText="noDataText" />
      </template>
    </vxe-grid>
    <template v-if="tableData.length > 0 && nextMarker">
      <div class="text-center mt-4">
        <a-button :loading="loading" type="link" @click="handleNextMarkerChange">{{ loading ? $t('common.loding') : $t('common.LoadMore') }}</a-button>
      </div>
    </template>
  </floating-scroll>
</template>

<script>
import * as R from 'ramda'
import _ from 'lodash'
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
    selectionType: {
      type: String,
      required: true,
    },
    inBaseSidePage: {
      type: Boolean,
      default: false,
    },
    isSidepageOpen: {
      type: Boolean,
      default: false,
    },
    spanMethod: {
      type: Function,
    },
    noDataText: String,
    showPage: Boolean,
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
    // 是否开启checkbox
    checkboxEnabled () {
      return (
        ((this.groupActions && this.groupActions.length > 0) || this.showCheckbox) &&
        this.selectionType === 'checkbox'
      )
    },
    // 是否开启radio
    radioEnabled () {
      return this.selectionType === 'radio'
    },
    gridStyle () {
      if (!this.inBaseSidePage && this.isSidepageOpen) return {} // 如果打开抽屉，且列表是最外层列表，则禁用横向滚动条
      return {
        width: R.is(Number, this.tableWidth) ? `${this.tableWidth}px` : this.tableWidth,
      }
    },
    tableData (val, oldVal) {
      return Object.values(this.data).sort((a, b) => a.index - b.index).map(item => item.data)
    },
    tablePage () {
      if (this.total <= 0 || !this.showPage) return null
      const currentPage = this.finalLimit ? Math.floor(this.offset / this.finalLimit) + 1 : 1
      return {
        total: this.total,
        currentPage,
        pageSize: this.finalLimit,
        layouts: this.pagerLayout,
      }
    },
    // 动态生成额外事件
    dynamicEvents () {
      const ret = {}
      if (this.checkboxEnabled) {
        ret['checkbox-change'] = this.handleCheckboxChange
        ret['checkbox-all'] = this.handleCheckboxChange
      } else if (this.radioEnabled) {
        ret['radio-change'] = this.handleRadioChange
      }
      return ret
    },
    // 动态生成额外Props
    dynamicProps () {
      const ret = {}
      if (this.checkboxEnabled) {
        ret['checkbox-config'] = { reserve: true, highlight: true }
      } else if (this.radioEnabled) {
        ret['radio-config'] = { reserve: true, highlight: true, trigger: 'row' }
      }
      return ret
    },
    hiddenScrollbar () {
      return !this.gridStyle.width
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
          this.tableWidth = 'auto'
          this.$nextTick(() => {
            this.tableColumns = this.genTableColumns()
          })
        })
      }
    },
    'config.showTagKeys' (val, oldVal) {
      if (!R.equals(val, oldVal)) {
        this.$nextTick(() => {
          this.tableWidth = 'auto'
          this.$nextTick(() => {
            this.tableColumns = this.genTableColumns()
          })
        })
      }
    },
    'config.sortColumnsMap' (val, oldVal) {
      if (!R.equals(val, oldVal)) {
        this.$nextTick(() => {
          this.tableWidth = 'auto'
          this.$nextTick(() => {
            this.tableColumns = this.genTableColumns()
          })
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
      this.tableWidth = 'auto'
      this.$nextTick(async () => {
        await this.$refs.grid.recalculate(true)
        const tableBodyEl = gridEl.querySelector('.vxe-table--body-wrapper .vxe-table--body')
        const tableBodyWidth = tableBodyEl.getBoundingClientRect().width
        if (tableBodyWidth) this.tableWidth = tableBodyWidth
        gridEl && this.$bus.$emit('FloatingScrollUpdate', {
          sourceElement: gridEl,
        })
      })
    },
    // 生成 table columns
    genTableColumns () {
      let defaultColumns = this.columns.filter(item => {
        if (R.is(Function, item.hidden)) return !item.hidden()
        return !item.hidden
      })
      const maps = this.config.sortColumnsMap
      if (!R.isNil(maps) && !R.isEmpty(maps)) {
        defaultColumns.sort((prev, next) => {
          const prevColumnIndex = _.get(maps, `[${prev.field}]`) || 0
          const nextColumnIndex = _.get(maps, `[${next.field}]`) || 0
          return prevColumnIndex - nextColumnIndex
        })
      }
      if (this.checkboxEnabled) {
        defaultColumns.unshift({ type: 'checkbox', width: 40 })
      } else if (this.radioEnabled) {
        defaultColumns.unshift({ type: 'radio', width: 40 })
      }
      if (this.showSingleActions && this.singleActions && this.singleActions.length) {
        defaultColumns.push({
          field: '_action',
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
        // 有操作时，在操作后面增加一列空的占位，目的是使表格在计算宽度的时候更准确
        // 确保操作的按钮文字尽可能的有足够宽度能够显示完整
        defaultColumns.push({
          field: '_action_placeholder',
          formatter: () => ' ',
        })
      }
      if (this.config && this.config.hiddenColumns) {
        R.forEach(item => {
          if (item.type !== 'checkbox' || item.type !== 'radio' || item.field !== '_action' || item.field !== '_action_placeholder') {
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
        const insertIndex = this.checkboxEnabled ? 2 : 1
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
    handleRadioChange ({ row }) {
      this.$emit('change-selected', [row])
      this.$emit('radio-change', row)
    },
    clearRadio () {
      this.$refs.grid.clearRadioReserve()
      this.$refs.grid.clearRadioRow()
    },
  },
}
</script>

<style lang="less" scoped>
.page-list-grid {
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
