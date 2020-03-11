<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body">
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item label="面板名称">
          <a-input placeholder="请输入面板名称" v-decorator="decorators.name" />
        </a-form-item>
        <a-form-item label="文件">
          <a-upload-dragger
            name="file"
            v-decorator="decorators.file"
            accept=".ocdb"
            :fileList="fileList"
            :multiple="false"
            :beforeUpload="handleBeforeUpload"
            @change="handleChange">
            <p class="ant-upload-drag-icon">
              <a-icon type="inbox" />
            </p>
            <p class="ant-upload-text">单击或将配置文件拖到该区域</p>
          </a-upload-dragger>
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { Base64 } from 'js-base64'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { uuid } from '@/utils/utils'
import storage from '@/utils/storage'

export default {
  name: 'DashboardImport',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      fileList: [],
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请输入名称' },
            ],
          },
        ],
        file: [
          'file',
          {
            rules: [
              { required: true, message: '请选择文件' },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
    }
  },
  computed: {
    ...mapGetters(['scope']),
  },
  destroyed () {
    this.pm = null
  },
  created () {
    this.pm = new this.$Manager('parameters', 'v1')
  },
  methods: {
    readFileAsync (file) {
      return new Promise((resolve, reject) => {
        let reader = new FileReader()
        reader.onload = () => {
          resolve(reader.result)
        }
        reader.onerror = reject
        reader.readAsDataURL(file)
      })
    },
    handleBeforeUpload () {
      return false
    },
    handleChange (info) {
      let fileList = [...info.fileList]
      fileList = fileList.slice(-1)
      this.fileList = fileList
    },
    hasDashboard () {
      return new Promise((resolve, reject) => {
        this.pm.get({ id: `dashboard_${this.scope}` }).then(() => {
          resolve(true)
        }).catch(error => {
          if (error.response && error.response.status === 404) {
            resolve(false)
          } else {
            reject(error)
          }
        })
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const fileData = await this.readFileAsync(values.file.file)
        const fileDataArr = fileData.split(',')
        const objStr = Base64.decode(Base64.decode(fileDataArr[1]))
        const data = JSON.parse(objStr)
        if (data.scope !== this.scope) {
          this.$message.warning(`选择的文件为${this.$t(`policyScopeLabel.${data.scope}`)}导出的配置，当前为${this.$t(`policyScopeLabel.${this.scope}`)}，请重新选择`)
          this.loading = false
          return
        }
        // 检查是否已经创建了dashboard配置
        const hasDashboard = await this.hasDashboard()
        if (!hasDashboard) {
          await this.pm.create({
            data: {
              name: `dashboard_${this.scope}`,
              value: [],
            },
          })
        }
        // 更新options
        const options = [...this.params.dashboardOptions]
        const id = `dashboard-${this.scope}-panel-${uuid(16)}`
        const item = {
          name: values.name,
          id,
        }
        options.push(item)
        await this.pm.update({
          id: `dashboard_${this.scope}`,
          data: {
            value: options,
          },
        })
        // 创建panel数据配置
        const panelData = {}
        for (let i = 0, len = data.items.length; i < len; i++) {
          panelData[`dashboard-item-${uuid(32)}`] = data.items[i]
        }
        await this.pm.create({
          data: {
            name: id,
            value: panelData,
          },
        })
        storage.set(`__oc_dashboard_${this.scope}__`, item)
        this.cancelDialog()
        this.params.fetchDashboardOptions()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
