<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ params.title }}</div>
    <div slot="body">
      <a-form :form="form.fc" hideRequiredMark v-bind="formItemLayout">
        <a-form-item :label="$t('common.text00097')" class="mb-0">
          <a-radio-group v-decorator="decorators.type" @change="handleExportTypeChange">
            <a-radio-button
              v-for="item of exportType"
              :key="item.key"
              :value="item.key">{{ item.label }}</a-radio-button>
          </a-radio-group>
          <span v-if="totalCount !== '-'" class="ml-3">{{ this.$t('common.total_count', [totalCount]) }}</span>
        </a-form-item>
        <a-form-item :label="$t('common.text00098')" class="mb-0">
          <a-checkbox
            :indeterminate="indeterminate"
            @change="handleCheckAllChange"
            :checked="checkAll">{{$t('common.checkAll')}}</a-checkbox>
        </a-form-item>
        <a-form-item v-bind="{wrapperCol: { span: 24 } }">
          <a-divider />
          <a-checkbox-group v-decorator="decorators.selected" @change="handleSelectedChange" class="w-100">
            <a-row>
              <draggable
                handle=".drag-icon"
                ghost-class="ghost"
                v-model="exportOptionItems">
                <transition-group type="transition" name="flip-list">
                  <template v-for="item of exportOptionItems">
                    <a-col
                      v-if="item.label"
                      :span="6"
                      :key="item.key"
                      class="mb-2 checkbox-item d-flex align-items-center">
                      <a-checkbox :value="item.key" class="text-truncate checkbox-property">
                        <span :title="item.label">{{ item.label }}</span>
                      </a-checkbox>
                      <a-icon type="drag" v-if="$appConfig.isPrivate || isBusinessCE" class="drag-icon pr-3" @click="iconClick" />
                    </a-col>
                  </template>
                </transition-group>
              </draggable>
            </a-row>
          </a-checkbox-group>
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button v-if="showOfflineExport" type="primary" @click="handleOfflineConfirm" :loading="loading">{{ $t("common.offline_export") }}</a-button>
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import XLSX from 'xlsx'
import draggable from 'vuedraggable'
import { download, getRequestT } from '@/utils/utils'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { getTagTitle } from '@/utils/common/tag'
import { addDataToSheetAfterFormat } from '@/utils/xlsx'
import { hasPermission } from '@/utils/auth'

export default {
  name: 'ExportListDataDialog',
  components: {
    draggable,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    let exportOptionItems = [...this.params.options.items]
    // 补充列
    if (!process.env.VUE_APP_IS_BUSINESS_CE && !this.$appConfig.isPrivate && (this.params.options.fixedItems || this.params.options.hiddenFields)) {
      const { fixedItems = [], hiddenFields = [] } = this.params.options
      exportOptionItems = exportOptionItems.filter(item => {
        if (hiddenFields.includes(item.key) || hiddenFields.includes(item.field)) {
          return false
        }
        return true
      })
      fixedItems.forEach(item => {
        const idx = exportOptionItems.findIndex(i => (i.key || i.field) === (item.key || item.field))
        if (idx > -1) {
          exportOptionItems[idx] = item
        } else {
          exportOptionItems.push(item)
        }
      })
    }
    exportOptionItems = exportOptionItems.filter(item => {
      const { hidden } = item
      if (hidden && R.type(hidden) === 'Function') {
        return !hidden()
      }
      return !hidden
    }).map(item => {
      return {
        key: item.key || item.field,
        label: item.label || item.title,
        ...item,
      }
    })
    const hiddenExportKeys = this.params.hiddenExportKeys || []
    // 导出备注信息（位置在 name 之后）
    const nameIndex = exportOptionItems.findIndex(item => item.field === 'name' || item.key === 'name')
    if (nameIndex > -1 && !hiddenExportKeys.includes('description')) {
      exportOptionItems = R.insert(nameIndex + 1, { label: this.$t('table.title.desc'), key: 'description' }, exportOptionItems)
    }
    let allExportKeys = exportOptionItems.filter(item => !hiddenExportKeys.includes(item.key)).map(item => item.key)
    const exportTags = (this.params.showTagColumns && this.params.config.showTagKeys) || []
    if (exportTags && exportTags.length) {
      allExportKeys = R.insertAll(0, exportTags.map(item => {
        return `tag:${item}`
      }), allExportKeys)
      exportOptionItems = R.insertAll(0, this.params.tagColumnsGenerator ? this.params.tagColumnsGenerator(exportTags) : exportTags.map(item => {
        return {
          label: getTagTitle(item),
          key: `tag:${item}`,
        }
      }), exportOptionItems)
    }
    const exportInstanceTags = (this.params.showTagColumns3 && this.params.config.showInstanceTagKeys) || []
    if (exportInstanceTags && exportInstanceTags.length) {
      allExportKeys = R.insertAll(0, exportInstanceTags.map(item => {
        return `instanceTag:${item}`
      }), allExportKeys)
      exportOptionItems = R.insertAll(0, exportInstanceTags.map(item => {
        return {
          label: getTagTitle(item),
          key: `instanceTag:${item}`,
        }
      }), exportOptionItems)
    }
    const exportProjectTags = (this.params.showTagColumns2 && this.params.config.showProjectTagKeys) || []
    if (exportProjectTags && exportProjectTags.length) {
      allExportKeys = R.insertAll(0, exportProjectTags.map(item => {
        return `projectTag:${item}`
      }), allExportKeys)
      const exportProjectTagsItems = this.params.tagColumns2Generator ? this.params.tagColumns2Generator(exportProjectTags) : exportProjectTags.map(item => {
        return {
          label: getTagTitle(item),
          key: `projectTag:${item}`,
        }
      })
      exportOptionItems = R.insertAll(0, exportProjectTagsItems, exportOptionItems)
    }
    const { sortColumnsMap = {} } = this.params.config
    exportOptionItems.sort((a, b) => {
      return (sortColumnsMap[a.key] || -1) - (sortColumnsMap[b.key] || -1)
    })
    const selectedExportKeys = allExportKeys.filter(key => {
      const { hiddenColumns = [] } = this.params.config
      return !hiddenColumns.includes(key)
    })

    const currentExportType = this.params.options.type || (hasPermission({ key: 'offline_exports_create' }) && this.params.options?.supportOfflineExport ? 'all' : 'custom')
    return {
      loading: false,
      isBusinessCE: process.env.VUE_APP_IS_BUSINESS_CE,
      exportOptionItems,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        type: [
          'type',
          {
            initialValue: currentExportType,
          },
        ],
        selected: [
          'selected',
          {
            initialValue: selectedExportKeys,
            rules: [
              { required: true, message: this.$t('common_94') },
            ],
          },
        ],
      },
      allExportKeys,
      currentExportType,
      indeterminate: selectedExportKeys.length !== allExportKeys.length,
      checkAll: selectedExportKeys.length && selectedExportKeys.length === allExportKeys.length,
      selectedExportKeys: selectedExportKeys,
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
    }
  },
  computed: {
    resource () {
      if (R.is(String, this.params.resource)) {
        return this.params.resource
      }
      return this.params.resource.resource.substr(0, this.params.resource.resource.length - 1)
    },
    showOfflineExport () {
      return hasPermission({ key: 'offline_exports_create' }) && this.params.options?.supportOfflineExport
    },
    exportType () {
      if (this.params.options.exportType) {
        return this.params.options.exportType
      }
      if (this.showOfflineExport) {
        return {
          all: { label: this.$t('common.all_filtered_data'), key: 'all' },
        }
      }
      return {
        all: { label: this.$t('common.all_filtered_data'), key: 'all' },
        custom: { label: this.$t('common.current_page_data'), key: 'custom' },
      }
    },
    downloadType () {
      return this.params.options.downloadType === 'local' && (this.$appConfig.isPrivate || this.isBusinessCE) ? 'local' : 'remote'
    },
    totalCount () {
      if (this.currentExportType === 'all') {
        if (this.params.selected && this.params.selected.length) {
          return this.params.selected.length
        }
        return this.params.total
      }
      if (this.currentExportType === 'custom') {
        return this.params.currentPageTotal
      }
      return '-'
    },
  },
  methods: {
    genParams (formValues, total, offline) {
      // 通用参数
      let normalParams = {}
      if (this.params.options.limit) {
        normalParams.limit = R.is(Function, this.params.options.limit) ? this.params.options.limit() : this.params.options.limit
      }
      if (this.params.options.getParams) {
        if (R.is(Function, this.params.options.getParams)) {
          normalParams = {
            ...normalParams,
            ...this.params.options.getParams({
              selected: formValues.selected,
              exportType: formValues.type,
              options: this.params.options,
            }),
          }
        } else {
          normalParams = { ...normalParams, ...this.params.options.getParams }
        }
      }
      if (this.params.extraParams) {
        normalParams = {
          ...normalParams,
          ...(R.is(Function, this.params.extraParams) ? this.params.extraParams({ currentExportType: this.currentExportType }) : this.params.extraParams),
        }
      }
      // 如果是自定义导出范围配置，则不进行默认的导出范围参数计算
      if (this.params.options.notCombineListParams) {
        const listParams = this.params.listParams
        normalParams = {
          ...normalParams,
          ...listParams,
        }
      }
      let params = { ...normalParams }
      const keys = []
      const texts = []
      const selected = [...formValues.selected]
      selected.sort((a, b) => {
        const idx = R.findIndex(R.propEq('key', a))(this.exportOptionItems)
        const idx2 = R.findIndex(R.propEq('key', b))(this.exportOptionItems)
        return idx - idx2
      })
      for (let i = 0, len = selected.length; i < len; i++) {
        const item = R.find(R.propEq('key', selected[i]))(this.exportOptionItems)
        let key = item.key
        if (key.startsWith('tag:') && this.params.tagColumnsExportKeyFormatter) {
          key = this.params.tagColumnsExportKeyFormatter(key.replace('tag:', ''))
        } else if (key.startsWith('projectTag:') && this.params.tagColumns2ExportKeyFormatter) {
          key = this.params.tagColumns2ExportKeyFormatter(key.replace('projectTag:', ''))
        } else if (key.startsWith('instanceTag:') && this.params.tagColumns3ExportKeyFormatter) {
          key = this.params.tagColumns3ExportKeyFormatter(key.replace('projectTag:', ''))
        }
        keys.push(key)
        texts.push(item.label)
      }
      // 本地导出
      if (this.downloadType === 'local') {
        params.details = true
      } else { // 远程导出
        params.export = this.params.options.fileType || 'xls'
        params.export_keys = keys.join(',')
        params.export_texts = texts.join(',')
      }
      // 导出范围
      if (this.currentExportType === 'custom') { // 导出当前页
        params.limit = this.params.currentPageTotal
      } else if (this.currentExportType === 'all') { // 导出当前筛选的全部
        // 如果没有自定义limit，导出全部直接把limt重置为0
        if (R.isNil(this.params.options.limit) || R.isEmpty(this.params.options.limit)) {
          params.limit = 0
        }
        if (this.params.selected.length) {
          // 自定义选中的过滤项
          if (this.params.options.genSelectedIdParams) {
            normalParams = this.params.options.genSelectedIdParams(normalParams, this.params.selectedItems)
          } else {
            const idField = (this.params.idKey && this.params.exportUseIdKey) ? this.params.idKey : 'id'
            if (normalParams.filter && normalParams.filter.length) {
              normalParams.filter = [...normalParams.filter, `${idField}.in(${this.params.selected.map(item => `"${item}"`).join(',')})`]
            } else {
              normalParams.filter = [`${idField}.in(${this.params.selected.map(item => `"${item}"`).join(',')})`]
            }
          }
        }
        params.force_no_paging = true
        if (params.offset) delete params.offset
        delete params.paging_marker
      }
      // 离线下载
      if (offline) {
        params.export_keys = keys
        params.export_texts = texts
        params.force_no_paging = true
        if (params.filter && params.filter.length) {
          params.filter = params.filter.flat(Infinity)
        }
        params.filter = params.filter.filter(item => item)
        if (!params.filter.length) {
          delete params.filter
        }
      }
      // 处理limit
      if (this.downloadType === 'remote') {
        params.export_limit = params.limit
      }
      if (this.params.options.transformParams) {
        params = this.params.options.transformParams(params)
      }
      if (params.force_no_paging) {
        delete params.limit
        delete params.export_limit
      }
      return params
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((errors, values) => {
          if (errors) {
            reject(errors)
          } else {
            resolve(values)
          }
        })
      })
    },
    async handleOfflineConfirm () {
      try {
        const values = await this.validateForm()
        this.loading = true
        const resource = this.params.options.resource || this.params.resource
        const total = this.params.options.resource && await this.getResourceTotal(resource)
        const params = this.genParams(values, total, true)
        const export_keys = params.export_keys
        const export_texts = params.export_texts
        delete params.export_keys
        delete params.export_texts
        let query = ''
        const paramKeys = Object.keys(params)
        const arrayParams = []
        paramKeys.map(key => {
          if (R.is(Array, params[key])) {
            arrayParams.push([key, params[key]])
            delete params[key]
          }
        })
        query = new URLSearchParams(params).toString()
        arrayParams.map(param => {
          param[1].map(val => {
            query += `&${new URLSearchParams({ [param[0]]: val }).toString()}`
          })
        })
        await new this.$Manager('offline_exports').create({
          data: {
            query,
            export_keys,
            export_texts,
            service: this.params.options.service || 'meter',
            resource: this.params.options.resource || this.params.resource,
            description: this.params.options.offlineExportDescription || '',
          },
        })
        this.$message.success(this.$t('common.success'))
        this.cancelDialog()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    async handleConfirm () {
      try {
        const values = await this.validateForm()
        this.loading = true
        const resource = this.params.options.resource || this.params.resource
        const total = this.params.options.resource && await this.getResourceTotal(resource)
        const params = this.genParams(values, total)
        console.log('params', params)

        if (this.downloadType === 'remote') {
          const response = await this.$http({
            methods: 'GET',
            url: `/${this.params.apiVersion}/${resource}`,
            params,
            responseType: 'blob',
            headers: {
              'X-Export-Keys': true,
            },
          })
          const contentDisposition = response.headers['content-disposition']
          let fileName = 'unknown'
          if (contentDisposition) {
            const fileNameMatch = contentDisposition.match(/filename="(.+)"/)
            if (fileNameMatch.length === 2) fileName = fileNameMatch[1]
          }
          download(response.data, fileName, response.headers['content-type'])
        } else {
          const { data: res = {} } = await new this.$Manager(resource, this.params.apiVersion).list({
            params,
          })
          let data = res.data || []
          if (R.is(Function, this.params.callback)) {
            data = await this.params.callback(data, this.selectedExportKeys)
          }
          // 生成数据
          this.localExport(this.exportOptionItems, data)
        }
        this.cancelDialog()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    handleExportTypeChange (e) {
      this.currentExportType = e.target.value
    },
    async handleSelectedChange (val) {
      this.indeterminate = !!val.length && val.length < this.allExportKeys.length
      this.checkAll = val.length === this.allExportKeys.length
      await this.$nextTick()
      this.selectedExportKeys = this.form.fc.getFieldValue('selected')
    },
    handleCheckAllChange (e) {
      this.form.fc.setFieldsValue({
        selected: e.target.checked ? this.allExportKeys : [],
      })
      this.checkAll = e.target.checked
      this.indeterminate = false
    },
    getResourceTotal (resource) {
      let listParams = this.params.listParams
      if (this.params.options.transformParams) {
        listParams = this.params.options.transformParams(listParams)
      }
      return new Promise((resolve, reject) => {
        this.$http({
          methods: 'GET',
          url: `/${this.params.apiVersion}/${resource}`,
          params: {
            $t: getRequestT(),
            ...listParams,
            limit: 1,
          },
        }).then((res) => {
          resolve(res.data.total)
        }).catch(() => {
          resolve(0)
        })
      })
    },
    getSheetMerges ({ titles, sheetOriginDatas, columns, expandColumns }) {
      const merges = []
      const mergesM = {}
      sheetOriginDatas.map(item => {
        if (mergesM[item._expandIndex]) {
          mergesM[item._expandIndex] += 1
        } else {
          mergesM[item._expandIndex] = 1
        }
      })
      const keys = Object.keys(mergesM).map(num => Number(num))
      keys.sort((a, b) => a - b)
      let idx = 1
      keys.map(key => {
        if (mergesM[key] > 1) {
          columns.map((s, i) => {
            merges.push({ s: { r: idx, c: i }, e: { r: idx + mergesM[key] - 1, c: i } })
          })
        }
        idx += mergesM[key]
      })
      return merges
    },
    localExport (cols, list) {
      list = list.filter(item => {
        if (this.currentExportType === 'all') {
          if (item[this.params.idKey || 'id'] && this.params.selected.length && !this.params.selected.includes(item[this.params.idKey || 'id'])) {
            return false
          }
        }
        return true
      })
      let dataList = list
      const columns = cols.filter(item => this.selectedExportKeys.includes(item.key))
      // 折叠行
      let expandColumns = []
      let getExpandData
      columns.map(item => {
        if (item.expandColumns && item.getExpandData) {
          expandColumns = item.expandColumns
          getExpandData = item.getExpandData
        }
      })
      const hasExpandColumn = expandColumns.length && getExpandData
      if (hasExpandColumn) {
        dataList = []
        list.map((item, index) => {
          const expandData = getExpandData({ row: item })
          if (expandData.length) {
            expandData.map(s => {
              dataList.push({ ...item, _expandData: s, _expandIndex: index })
            })
          } else {
            dataList.push({ ...item, _expandData: {}, _expandIndex: index })
          }
        })
      }
      // 标题行
      const titles = columns.map(item => item.label)
      if (hasExpandColumn) {
        titles.push(...expandColumns.map(item => item.label || item.title))
      }
      // 每列宽度
      const colWidthList = columns.map(item => {
        return { wch: item.width ? Math.ceil(Number(item.width) / 8) : 20 }
      })
      // 未添加 needExportFormat 视为忽略单元格格式处理
      const allColumns = [...columns, ...expandColumns]
      const ignoreColsIndex = []
      allColumns.map((item, index) => {
        if (!item.needExportFormat) {
          ignoreColsIndex.push(index)
        }
      })
      const filename = `${this.params.options.exportTitle || this.params.title}.xlsx`
      const wb = XLSX.utils.book_new()
      const allLength = dataList.length
      const sheetMaxLen = 60000 // 每个sheet最多多少条
      let sheetIdx = 1
      let sheetDatas = []
      let sheetOriginDatas = []
      // 生成sheet
      for (let i = 1; i < allLength + 1; i++) {
        const idx = Math.ceil(i / sheetMaxLen)
        if (idx !== sheetIdx) {
          // 保存旧表
          const ws_name = 'sheet' + sheetIdx
          const ws = addDataToSheetAfterFormat({ data: [titles, ...sheetDatas], ignoreColsIndex })
          if (hasExpandColumn) {
            const sheetMerges = this.getSheetMerges({ titles, sheetOriginDatas, columns, expandColumns })
            ws['!merges'] = sheetMerges
          }
          XLSX.utils.book_append_sheet(wb, ws, ws_name)
          // 插入新表
          sheetIdx = idx
          sheetDatas = []
          sheetOriginDatas = []
        } else if (i === allLength) { // 尾表
          const row = []
          columns.map(column => {
            let colData = ''
            if (column.formatter) {
              const data = column.formatter({ row: dataList[i - 1], cellValue: dataList[i - 1][column.key || column.field] })
              colData = data === '-' ? '' : data
            } else {
              if (column.key?.startsWith('tag:')) {
                const cKey = column.key.replace('tag:', '')
                colData = dataList[i - 1].metadata?.[cKey] || ''
              } else if (column.key?.startsWith('projectTag:')) {
                const cKey = column.key.replace('projectTag:', '')
                colData = dataList[i - 1].project_metadata?.[cKey] || ''
              } else {
                colData = dataList[i - 1][column.key || column.field] || ''
              }
            }
            row.push(colData)
          })
          // 折叠行
          if (hasExpandColumn) {
            expandColumns.map(column => {
              let colData = ''
              if (column.formatter) {
                colData = column.formatter({ row: dataList[i - 1]._expandData, cellValue: dataList[i - 1]._expandData[column.key || column.field] })
                colData = colData === '-' ? '' : colData
              } else {
                colData = dataList[i - 1]._expandData[column.key || column.field] || ''
              }
              row.push(colData)
            })
          }
          sheetDatas.push(row)
          sheetOriginDatas.push(dataList[i - 1])
          const ws_name = 'sheet' + sheetIdx
          const ws = addDataToSheetAfterFormat({ data: [titles, ...sheetDatas], ignoreColsIndex })
          if (hasExpandColumn) {
            const sheetMerges = this.getSheetMerges({ titles, sheetOriginDatas, columns, expandColumns })
            ws['!merges'] = sheetMerges
          }
          ws['!cols'] = colWidthList
          XLSX.utils.book_append_sheet(wb, ws, ws_name)
        }
        // 生成单行数据
        const row = []
        columns.map(column => {
          let colData = ''
          if (column.formatter) {
            colData = column.formatter({ row: dataList[i - 1], cellValue: dataList[i - 1][column.key || column.field] })
            colData = colData === '-' ? '' : colData
          } else {
            if (column.key?.startsWith('tag:')) {
              const cKey = column.key.replace('tag:', '')
              colData = dataList[i - 1].metadata?.[cKey] || ''
            } else if (column.key?.startsWith('projectTag:')) {
              const cKey = column.key.replace('projectTag:', '')
              colData = dataList[i - 1].project_metadata?.[cKey] || ''
            } else {
              colData = dataList[i - 1][column.key || column.field] || ''
            }
          }
          row.push(colData)
        })
        // 折叠行
        if (hasExpandColumn) {
          expandColumns.map(column => {
            let colData = ''
            if (column.formatter) {
              colData = column.formatter({ row: dataList[i - 1]._expandData, cellValue: dataList[i - 1]._expandData[column.key || column.field] })
              colData = colData === '-' ? '' : colData
            } else {
              colData = dataList[i - 1]._expandData[column.key || column.field] || ''
            }
            row.push(colData)
          })
        }
        sheetDatas.push(row)
        sheetOriginDatas.push(dataList[i - 1])
      }
      XLSX.writeFile(wb, filename)
    },
    iconClick (e) {
      e.preventDefault()
    },
  },
}
</script>

<style lang="less" scoped>
@import '../../../styles/less/theme.less';
.tag-fields-wrap {
  max-height: 100px;
  overflow: auto;
}
.checkbox-item {
  ::v-deep {
    .ant-checkbox-wrapper {
      display: flex;
      align-items: center;
      .ant-checkbox {
        margin-top: 3px;
        & + span {
          flex: 1;
          overflow: hidden;
          text-overflow:ellipsis;
          white-space: nowrap;
        }
      }
    }
    .drag-icon {
      visibility: hidden;
    }
    .checkbox-property {
      padding-right: 15px;
    }
  }
  &:hover {
    ::v-deep {
      .drag-icon {
        visibility: visible !important;;
      }
    }
  }
}
.flip-list-move {
  transition: transform 0.5s;
}
.drag-icon {
  position: absolute;
  right: 0;
  cursor: move;
}
.ghost {
  opacity: 0.7;
  background: @primary-color;
  ::v-deep {
    label span {
      color: #fff;
    }
  }
}
</style>
