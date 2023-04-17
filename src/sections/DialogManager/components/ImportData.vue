<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title || $t('common.import_data')}}</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-alert type="warning" class="mb-2" v-if="isAlertShow">
          <template v-slot:message>
            <div class="messages-list">
              <p v-if="isDownloadShow">{{ $t('common.import_tpl_tips') }}<a-button type="link" @click="handleDownloadTemplate">{{$t('common.download_tpl')}}</a-button></p>
            </div>
          </template>
        </a-alert>
        <div class="pt-3 pb-3">
          <a-form-item>
            <a-upload-dragger
              v-decorator="decorators.fileList"
              :beforeUpload="beforeUpload"
              :fileList="fileList"
              :accept="accept"
              :remove="handleRemove">
              <div class="pt-3 pb-3">
                <p class="ant-upload-drag-icon"><a-icon type="inbox" /></p>
                <p class="ant-upload-text">{{$t('common.drag_file_area')}}</p>
                <p class="ant-upload-hint">{{$t('common.file_type_validate')}}</p>
              </div>
            </a-upload-dragger>
          </a-form-item>
        </div>
     </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
/**
 * 批量导入通用模板
 *
 * 使用示例：
 * this.createDialog('ImportDataDialog', {
 *   title: '弹框名称',
 *   templateConfig: {
 *     data: [
 *       ['ID', '资源名称'],
 *       ['No12564', '资源xx']
 *     ],
 *     filename: '下载模板名称',
 *     columns: [
 *       {
 *         field: 'id',
 *         title: 'ID',
 *         required: true, // required 会验证文件中该字段是否传入
 *         validator: (val) => { // 验证该字段是否合乎预期
 *           const ret = { validate: true }
 *           if (!['ecs', 'rds'].includes(val)) {
 *             ret.validate = false
 *             ret.tooltip = '资源id必须为ecs，rds'
 *           }
 *           return ret
 *         }
 *       },
 *       {
 *         field: 'name',
 *         title: '资源名称',
 *         formatter: ({ row, cellValue }) => { // row = { ID: 'No12564', 资源名称: '资源xx' } cellValue = '资源xx'
 *           return cellValue || row['资源名称']
 *         }
 *       },
 *     ]
 *   },
 *   managerResources: 'resources',
 *   apiVersion: 'v1',
 *   createFn: ({ vm, sheetData, dataList }) => { // 未传入managerResources的备选方案
 *     console.log(sheetData, dataList)
 *     vm.cancelDialog()
 *   },
 *   ok: () => {
 *     this.list.refresh()
 *   }
 * })
 */

import XLSX from 'xlsx'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { Manager } from '@/utils/manager'

export default {
  name: 'ImportDataDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      accept: '.xlsx',
      fileList: [],
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        fileList: ['fileList', {
          rules: [
            { required: true, message: this.$t('common.import_tpl_file') },
          ],
        }],
      },
    }
  },
  computed: {
    isDownloadShow () {
      return this.params.templateConfig
    },
    isAlertShow () {
      return this.isDownloadShow
    },
  },
  methods: {
    beforeUpload (file) {
      this.fileList = [file]
      return false
    },
    handleClearFile () {
      this.fileList = []
    },
    handleRemove () {
      this.handleClearFile()
    },
    handleDownloadTemplate () {
      const { templateConfig = {} } = this.params
      const data = templateConfig.data || []
      const filename = `${templateConfig.filename || this.$t('common.template')}.xlsx`
      const ws_name = 'Sheet1'
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet(data)
      if (templateConfig.cols) {
        ws['!cols'] = templateConfig.cols
      }
      XLSX.utils.book_append_sheet(wb, ws, ws_name)
      XLSX.writeFile(wb, filename)
    },
    async doCreate (sheetData, dataList) {
      try {
        const { managerResources, apiVersion = 'v2', ok, createFn } = this.params
        if (managerResources) {
          const manager = new Manager(managerResources, apiVersion)
          await manager.create({
            data: {
              data: dataList,
            },
          })
          this.cancelDialog()
          this.$message.success(this.$t('common.success'))
          ok && ok()
        } else if (createFn) {
          createFn({
            vm: this,
            sheetData,
            dataList,
          })
        }
      } catch (error) {
        throw error
      }
    },
    async handleConfirm () {
      try {
        if (!this.fileList || this.fileList.length === 0) {
          this.form.fc.setFieldsValue({
            fileList: undefined,
          })
        }
        const that = this
        await this.form.fc.validateFields()
        this.loading = true
        var fileReader = new FileReader()
        fileReader.onload = async function (ev) {
          try {
            var data = ev.target.result
            var workbook = XLSX.read(data, {
              type: 'binary',
            }) // 以二进制流方式读取得到整份excel表格对象
            var sheetData = [] // 存储获取到的数据
          } catch (e) {
            throw e
          }
          for (var sheet in workbook.Sheets) {
            if (workbook.Sheets.hasOwnProperty(sheet)) {
              sheetData = sheetData.concat(XLSX.utils.sheet_to_json(workbook.Sheets[sheet]))
            }
          }
          // 整理数据
          const list = []
          const requiredCols = []
          const validatorTips = []
          const { columns = [] } = that.params.templateConfig
          sheetData.map(item => {
            const row = {}
            columns.map(col => {
              const cellData = col.formatter ? col.formatter({ row: item, cellValue: item[col.title] }) : item[col.title]
              const v = cellData ? (cellData + '').trim() : ''
              row[col.field] = v
              if (!v) {
                if (col.required && !requiredCols.includes(col.title)) {
                  requiredCols.push(col.title)
                }
              }
              if (col.validator) {
                const valid = col.validator(v)
                if (!valid.validate && !validatorTips.includes(valid.tooltip)) {
                  validatorTips.push(valid.tooltip)
                }
              }
            })
            list.push(row)
          })
          // 验证必填项
          if (requiredCols.length) {
            that.$message.error(that.$t('common.required_cols', [requiredCols.join(',')]))
          } else if (validatorTips.length) {
            that.$message.error(validatorTips.join(','))
          } else {
            that.doCreate(sheetData, list)
          }
        }
        // 以二进制方式打开文件
        fileReader.readAsBinaryString(this.fileList[0])
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="less" scoped>
  .messages-list p{
    margin-bottom: 2px;
  }
</style>
