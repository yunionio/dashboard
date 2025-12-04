<template>
  <component :is="tableWrapper" ref="floating-scroll" :hiddenScrollbar="hiddenScrollbar">
    <div class="table-container d-flex">
      <template v-if="showTagConfig">
        <tree-project
          ref="projectTag"
          v-show="treeToggleOpen"
          :treeToggleOpen="treeToggleOpen"
          :tag-config-params="{config,...tagConfigParams}"
          @select="handleProjectTagSelect"
          @treeProjectConfig="handleTreeProjectConfig" />
      </template>
      <div id="vxe-table" :style="enableVirtualScroll ? 'width:100%' : 'flex: 1 1 auto;'">
        <vxe-grid
          :class="enableVirtualScroll ? 'page-list-grid-virtual-scroll' : 'page-list-grid'"
          show-header-overflow
          highlight-hover-row
          highlight-current-row
          ref="grid"
          align="left"
          :data="tableData"
          :row-id="idKey"
          :columns="tableColumns"
          :style="gridStyle"
          :sort-config="{ sortMethod: () => {} }"
          :tooltip-config="{ showAll: false }"
          :expand-config="expandConfig"
          :span-method="spanMethod"
          :sync-resize="treeToggleOpen"
          @sort-change="handleSortChange"
          v-on="dynamicEvents"
          v-bind="dynamicProps">
          <template v-slot:empty>
            <deny v-if="isResDeny" />
            <loader v-else :loading="loading" :noDataText="noDataText" />
          </template>
          <template v-if="showPage && !isResDeny && pagerType === 'pager'" v-slot:pager>
            <vxe-pager
              :layouts="tablePage.layouts"
              :current-page="tablePage.currentPage"
              :page-size="tablePage.pageSize"
              :total="tablePage.total"
              @page-change="handlePageChange">
              <template v-if="!loading && showTableOverviewIndexs" v-slot:left>
                <div class="table-overview">
                  {{ $t('common.table.overview') }}：{{ tableOverview }}
                </div>
              </template>
            </vxe-pager>
          </template>
        </vxe-grid>
        <template v-if="loadMoreShow">
          <div class="text-center mt-3 load-more-wrapper">
            <div v-if="enableVirtualScroll" class="vxe-pager d-flex align-items-center justify-content-end" style="float:right">
              <a-select v-model="loadMoreSize" style="min-width:100px;font-size:12px" size="small" @change="handleLoadMoreSizeChange">
                <a-select-option v-for="size in loadMorePagings" :value="size" :key="size" style="text-align:center;font-size:12px">{{$t('common.some_items_peer_time', [size])}}</a-select-option>
              </a-select>
              <span class="ml-3">{{$t('common.current_total_items', [tableData.length])}}</span>
            </div>
            <a-button v-if="nextMarker" :loading="loading" type="link" @click="handleNextMarkerChange">{{ loading ? $t('common.loding') : $t('common.LoadMore') }}</a-button>
            <span v-else>{{ $t('common.load_no_more') }}</span>
          </div>
        </template>
      </div>
    </div>

  </component>
</template>

<script>
import Sortable from 'sortablejs'
import XEUtils from 'xe-utils'
import { mapGetters } from 'vuex'
import * as R from 'ramda'
import _ from 'lodash'
import { addResizeListener, removeResizeListener } from '@/utils/resizeEvent'
import { getTagTitle } from '@/utils/common/tag'
import { hasPermission } from '@/utils/auth'
import storage from '@/utils/storage'
import TreeProject from '@/sections/TreeProject'
import WindowsMixin from '@/mixins/windows'
import Actions from '../Actions'
import MultipleSort from './MultipleSort'
import Deny from './Deny.vue'

export default {
  name: 'PageListTable',
  components: {
    TreeProject,
    Deny,
  },
  mixins: [WindowsMixin],
  props: {
    id: String,
    idKey: String,
    list: Object,
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
    // 是否隐藏列选择
    hideRowselect: {
      type: Boolean,
      default: false,
    },
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
    pagerType: String,
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
    beforeShowMenuLoaded: Boolean,
    showTagConfig: Boolean,
    treeToggleOpen: Boolean,
    tagConfigParams: {
      type: Object,
      default: () => {},
    },
    // create list传递的resource
    resource: [String, Object, Function],
    updateConfig: {
      type: Function,
      required: true,
    },
    // 表格编辑配置
    editConfig: Object,
    tableOverviewIndexs: {
      type: Array,
    },
    enableVirtualScroll: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    const storageKey = this.id && `__oc_${this.id}__`
    return {
      // table width
      tableWidth: 'auto',
      tableColumns: [],
      finalLimit: this.getLimit(),
      storageKey,
      storageConfig: this.id && storage.get(storageKey),
      loadMoreSize: 20,
      loadMorePagings: [20, 100, 200, 500, 1000],
      vxeGridHeight: 0,
    }
  },
  computed: {
    ...mapGetters(['permission']),
    tableWrapper () {
      return this.enableVirtualScroll ? 'div' : 'floating-scroll'
    },
    // 是否开启checkbox
    checkboxEnabled () {
      if (this.hideRowselect) return false
      return this.selectionType === 'checkbox'
    },
    // 是否开启radio
    radioEnabled () {
      return !this.hideRowselect && this.selectionType === 'radio'
    },
    gridStyle () {
      if (!this.inBaseSidePage && this.isSidepageOpen) return {} // 如果打开抽屉，且列表是最外层列表，则禁用横向滚动条
      return {
        width: R.is(Number, this.tableWidth) ? `${this.tableWidth}px` : this.tableWidth,
      }
    },
    tableData (val, oldVal) {
      if (this.isResDeny) return []
      const dataList = Object.values(this.data).sort((a, b) => a.index - b.index)
      if (this.total <= 0 || !this.showPage) {
        return dataList.map(item => item.data)
      }
      const lastPage = Math.floor(this.total / this.finalLimit) + 1
      const currentPage = this.tablePage.currentPage
      const ret = []
      for (var i = 0; i < dataList.length; i++) {
        if (i === 0 && currentPage === 1) {
          dataList[i].data.__first = true
        }
        if (i === dataList.length - 1 && currentPage === lastPage) {
          dataList[i].data.__last = true
        }
        ret.push(dataList[i].data)
      }
      return ret
    },
    tablePage () {
      if (this.total <= 0 || !this.showPage) return {}
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
      if (this.id) {
        ret['resizable-change'] = this.handleResizeableChange
      }
      ret['edit-closed'] = this.handleEditClosed
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
      if (this.id) {
        ret.resizable = true
      }
      if (this.editConfig) {
        ret['edit-config'] = this.editConfig
        ret['keep-source'] = true
      }
      if (this.enableVirtualScroll) {
        ret.height = this.vxeGridHeight
        ret['scroll-x'] = { gt: 1 }
        ret['scroll-y'] = { gt: 1 }
      }
      return ret
    },
    hiddenScrollbar () {
      return !this.gridStyle.width
    },
    l2MenuVisibleForStore () {
      return this.$store.state.setting.l2MenuVisible
    },
    loadMoreShow () {
      return this.tableData.length > 0 && ((typeof this.nextMarker) !== 'undefined' || this.pagerType === 'loadMore')
    },
    showTableOverviewIndexs () {
      return this.tableOverviewIndexs?.length > 0
    },
    tableOverview () {
      if (this.showTableOverviewIndexs) {
        return this.tableOverviewIndexs.map(item => {
          return `${item.key}: ${item.value}`
        }).join('、')
      }
      return []
    },
    isResDeny () {
      return !hasPermission({ key: `${this.resource}_list`, permissionData: this.permission })
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
    singleActions: {
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
    'config.showProjectTagKeys' (val, oldVal) {
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
    beforeShowMenuLoaded (val, oldVal) {
      if (!R.equals(val, oldVal)) {
        this.$nextTick(() => {
          this.tableWidth = 'auto'
          this.$nextTick(() => {
            this.tableColumns = this.genTableColumns()
          })
        })
      }
    },
    // 如果切换二级菜单显示隐藏后，重新计算表格宽度
    l2MenuVisibleForStore () {
      this.$nextTick(() => {
        if (!this.enableVirtualScroll) {
          this.updateFloatingScroll()
        }
      })
    },
  },
  mounted () {
    if (this.enableVirtualScroll) {
      this.initHeight()
    } else {
      this.initFloatingScrollListener()
    }
    this.treeDrop()
  },
  methods: {
    initHeight () {
      const gridEl = this.$refs.grid.$el
      const wH = document.body.offsetHeight
      const remBase = parseInt(window.getComputedStyle(document.documentElement).fontSize) / 4
      this.vxeGridHeight = wH - gridEl.getBoundingClientRect().y - (48 + remBase * 4 + 20 + 15)
    },
    // 初始化tbody监听器，发生变化更新虚拟滚动条，以保证宽度是正确的
    initFloatingScrollListener () {
      const gridEl = this.$refs.grid.$el
      const tableBodyEl = gridEl.querySelector('.vxe-table--body-wrapper .vxe-table--body')
      addResizeListener(tableBodyEl, this.updateFloatingScroll)
      window.addEventListener('resize', this.updateFloatingScroll)
      this.$once('hook:beforeDestroy', () => {
        removeResizeListener(tableBodyEl, this.updateFloatingScroll)
        window.removeEventListener('resize', this.updateFloatingScroll)
      })
    },
    // 更新虚拟滚动条
    updateFloatingScroll () {
      const floatingScroll = this.$refs['floating-scroll']
      const scrollLeft = floatingScroll.$el.scrollLeft
      const gridEl = this.$refs.grid && this.$refs.grid.$el
      if (!gridEl) return
      this.tableWidth = 'auto'
      this.$nextTick(async () => {
        await this.$refs.grid.recalculate(true)
        const tableBodyEl = gridEl.querySelector('.vxe-table--body-wrapper .vxe-table--body')
        const tableBodyWidth = tableBodyEl.getBoundingClientRect().width
        if (tableBodyWidth) this.tableWidth = tableBodyWidth - 15
        gridEl && this.$bus.$emit('FloatingScrollUpdate', {
          sourceElement: gridEl,
        })
        this.$nextTick(() => {
          floatingScroll.$el.scrollLeft = scrollLeft
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
          const prevColumnIndex = _.get(maps, `${prev.field}`, 0)
          const nextColumnIndex = _.get(maps, `${next.field}`, 0)
          return prevColumnIndex - nextColumnIndex
        })
      }
      if (this.checkboxEnabled) {
        defaultColumns.unshift({ type: 'checkbox', width: 40, showHeaderOverflow: false, resizable: false })
      } else if (this.radioEnabled) {
        defaultColumns.unshift({ type: 'radio', width: 40, showHeaderOverflow: false, resizable: false })
      }
      if (this.beforeShowMenuLoaded && this.showSingleActions && this.singleActions && this.singleActions.length) {
        defaultColumns.push({
          field: '_action',
          title: this.$t('table.title._action'),
          minWidth: 120,
          resizable: false,
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
                      fontSize: '14px',
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
                }, this.$t('table.title._action')),
              ]
            },
          },
        })
        // 有操作时，在操作后面增加一列空的占位，目的是使表格在计算宽度的时候更准确
        // 确保操作的按钮文字尽可能的有足够宽度能够显示完整
        // defaultColumns.push({
        //   field: '_action_placeholder',
        //   formatter: () => ' ',
        // })
      }
      if (this.config && this.config.hiddenColumns) {
        R.forEach(item => {
          if (item.type !== 'checkbox' || item.type !== 'radio' || item.field !== '_action' || item.field !== '_action_placeholder') {
            if (this.storageConfig && this.storageConfig[item.field] && this.storageConfig[item.field].width) {
              item.minWidth = this.storageConfig[item.field].width
              item.width = this.storageConfig[item.field].width
            }
            item.visible = !this.config.hiddenColumns.includes(item.field)
          }
        }, defaultColumns)
      }
      if (this.config && this.config.showTagKeys && this.config.showTagKeys.length) {
        const tagColumns = this.config.showTagKeys.map(item => {
          const config = {
            minWidth: 100,
          }
          if (this.storageConfig && this.storageConfig[item] && this.storageConfig[item].width) {
            config.minWidth = this.storageConfig[item].width
            config.width = this.storageConfig[item].width
          }
          return {
            ...config,
            field: item,
            title: getTagTitle(item),
            showOverflow: 'title',
            sortable: true,
            slots: {
              tag_type: ({ row }) => 'resource',
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
      if (this.config && this.config.showProjectTagKeys && this.config.showProjectTagKeys.length) {
        const tagColumns = this.config.showProjectTagKeys.map(item => {
          const config = {
            minWidth: 100,
          }
          if (this.storageConfig && this.storageConfig[item] && this.storageConfig[item].width) {
            config.minWidth = this.storageConfig[item].width
            config.width = this.storageConfig[item].width
          }
          return {
            ...config,
            field: item,
            title: getTagTitle(item),
            showOverflow: 'title',
            sortable: true,
            slots: {
              tag_type: ({ row }) => 'project',
              default: ({ row }) => {
                const message = row.project_metadata && row.project_metadata[item]
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
      // 扩展
      defaultColumns = defaultColumns.map(item => {
        // 列表项默认最小宽度
        if (item.type !== 'checkbox' || item.type !== 'radio' || item.field !== '_action' || item.field !== '_action_placeholder') {
          item.minWidth = item.minWidth || 100
        }
        // 两个字段同时排序
        if (!item.sortable && (item.sortFields || item.sortByList) && (!item.slots || !item.slots.header)) {
          item.slots = item.slots || {}
          item.slots.header = ({ row }) => {
            return [<span>{ item.title }</span>, <MultipleSort column={item} listParams={this.list.params || {}} onDoSort={this.handleSortChange} />]
          }
        }
        if (item.showOverflow !== 'ellipsis') {
          item.className = item.className ? item.className + ' table--td-auto-height' : 'table--td-auto-height'
        }
        return item
      })
      defaultColumns.forEach(item => {
        if (item.type === 'checkbox') return
        if (!item.originSlots) {
          item.originSlots = item.slots || {}
        }
        const slots = {
          ...item.originSlots,
          default: (params, h) => {
            if (params.row.isDataShow) {
              if (item.originSlots?.default) {
                return item.originSlots.default(params, h)
              }
              if (item.formatter) {
                return item.formatter({ ...params, cellValue: params.row[item.field] })
              }
              return params.cellValue || params.row[item.field]
            }
            return ''
          },
        }
        item.slots = slots
      })
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
    handleSortChange ({ column, property, order }) {
      this.$emit('clear-selected')
      this.$emit('do-sort', property, order, column)
    },
    handleCheckboxChange ({ selection }) {
      this.$emit('change-selected', selection)
    },
    clearCheckbox () {
      this.$refs.grid.clearCheckboxReserve()
      this.$refs.grid.clearCheckboxRow()
    },
    handleLoadMoreSizeChange (val) {
      this.$emit('change-load-more-size', val)
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
    handleResizeableChange ({ column }) {
      const config = {
        [column.property]: {
          width: column.resizeWidth,
        },
      }
      const newConfig = R.mergeDeepRight({ ...this.storageConfig }, config)
      storage.set(this.storageKey, newConfig)
      this.storageConfig = newConfig
    },
    handleEditClosed () {
      this.$emit('edit-closed')
    },
    treeDrop () {
      this.$nextTick(() => {
        const xTable = this.$refs.grid
        this.sortable2 = Sortable.create(xTable.$el.querySelector('.body--wrapper>.vxe-table--body tbody'), {
          handle: '.drag-btn',
          onEnd: ({ item, oldIndex }) => {
            const options = { children: 'children' }
            const targetTrElem = item
            const wrapperElem = targetTrElem.parentNode
            const prevTrElem = targetTrElem.previousElementSibling
            const tableTreeData = this.tableData
            const selfRow = xTable.getRowNode(targetTrElem).item
            const selfNode = XEUtils.findTree(tableTreeData, row => row === selfRow, options)
            if (prevTrElem) {
              // 移动到节点
              const prevRow = xTable.getRowNode(prevTrElem).item
              const prevNode = XEUtils.findTree(tableTreeData, row => row === prevRow, options)
              if (XEUtils.findTree(selfRow[options.children], row => prevRow === row, options)) {
                // 错误的移动
                const oldTrElem = wrapperElem.children[oldIndex]
                wrapperElem.insertBefore(targetTrElem, oldTrElem)
                return this.$XModal.message({ content: '不允许自己给自己拖动！', status: 'error' })
              }
              const currRow = selfNode.items.splice(selfNode.index, 1)[0]
              if (xTable.isTreeExpandByRow(prevRow)) {
                // 移动到当前的子节点
                prevRow[options.children].splice(0, 0, currRow)
              } else {
                // 移动到相邻节点
                prevNode.items.splice(prevNode.index + (selfNode.index < prevNode.index ? 0 : 1), 0, currRow)
              }
            } else {
              // 移动到第一行
              const currRow = selfNode.items.splice(selfNode.index, 1)[0]
              tableTreeData.unshift(currRow)
            }
            // 如果变动了树层级，需要刷新数据
            this.tableData = [...tableTreeData]
          },
        })
      })
    },
    handleProjectTagSelect (filter) {
      this.$emit('clear-selected')
      this.$emit('project-tag-filter-change', filter)
    },
    handleTreeProjectConfig () {
      this.createDialog('TreeConfigDialog', {
        title: this.$t('common.text00011'),
        resource: this.resource,
        ...this.tagConfigParams,
      })
    },
    setCurrentRow (data) {
      const row = this.tableData.filter(item => item.id === data.id)
      if (row.length) {
        this.$refs.grid.setCurrentRow(row[0])
        this.$refs.grid.scrollToRow(row[0])
      }
    },
    clearCurrentRow () {
      this.$refs.grid.clearCurrentRow()
    },
  },
}
</script>

<style lang="less" scoped>
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
.page-list-grid-virtual-scroll {
  ::v-deep {
    .vxe-table.is--empty .vxe-table--empty-block, .vxe-table.is--empty .vxe-table--empty-placeholder {
      height: auto !important;
    }
  }
}
.sortable-tree-demo .drag-btn {
  cursor: move;
  font-size: 12px;
}
.sortable-tree-demo .vxe-body--row.sortable-ghost,
.sortable-tree-demo .vxe-body--row.sortable-chosen {
  background-color: #dfecfb;
}
.table-overview {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  font-size: 14px;
}
.load-more-wrapper {
  height: 48px;
  line-height: 48px;
}
</style>
