<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('network.mac_ip.import_mapping_table')}}</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-alert type="warning" class="mb-2">
          <template v-slot:message>
            <div class="messages-list">
              <p>{{ $t('network.import_tpl_tips') }}<a-button type="link" @click="handleDownloadTemplate">{{$t('network.download_tpl')}}</a-button></p>
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
                <p class="ant-upload-text">{{$t('network.drag_file_area')}}</p>
                <p class="ant-upload-hint">{{$t('network.file_type_validate')}}</p>
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
import XLSX from 'xlsx'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { Manager } from '@/utils/manager'

export default {
  name: 'ImportNetworkIpMacsDialog',
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
            { required: true, message: this.$t('network.import_tpl_file') },
          ],
        }],
      },
    }
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
      const data = [
        ['IP', 'MAC'],
      ]
      const filename = `${this.$t('network.mapping_table_tpl')}.xlsx`
      const ws_name = 'Sheet1'
      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet(data)
      ws['!cols'] = [
        { wch: 20 },
        { wch: 20 },
      ]
      XLSX.utils.book_append_sheet(wb, ws, ws_name)
      XLSX.writeFile(wb, filename)
    },
    async doCreate (sheetData) {
      try {
        const manager = new Manager('network_ip_macs/batch-create')
        const data = {
          network_id: this.params.data[0].id,
        }
        const ip_mac = {}
        sheetData.forEach(item => {
          ip_mac[`${item.IP}`] = item.MAC
        })
        data.ip_mac = ip_mac

        await manager.create({
          data,
        })
        this.cancelDialog()
        this.$message.success(this.$t('common.success'))
        this.params.ok && this.params.ok()
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
          that.doCreate(sheetData)
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
