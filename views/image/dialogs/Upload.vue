<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">上传</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <div slot="message">
          设置更多属性，请上传成功后，点击【修改属性】
         <br />ISO格式镜像只有OneCloud平台可用
        </div>
      </a-alert>
      <a-form
        :form="form.fc">
        <a-form-item :label="`指定${$t('dictionary.project')}`" class="mb-0" v-bind="formItemLayout">
          <domain-project :fc="form.fc" :decorators="{ project: decorators.project, domain: decorators.domain }" />
        </a-form-item>
        <a-form-item label="镜像名称" v-bind="formItemLayout">
          <a-input placeholder="字母开头，数字和字母大小写组合，长度为2-128个字符，可含'.','-','_'" v-decorator="decorators.name" />
        </a-form-item>
        <a-form-item label="上传方式" v-bind="formItemLayout">
          <a-radio-group @change="handleUploadTypeChange" v-decorator="decorators.uploadType">
            <a-radio-button value="file">
              上传镜像文件
            </a-radio-button>
            <a-radio-button value="url">
              输入镜像URL
            </a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="镜像文件" v-bind="formItemLayout" v-if="show" help="上传过程中请勿刷新或者关闭页面，否则上传任务会中断。">
          <a-upload
            @change="handleUploadChange"
            :fileList="fileList"
            :beforeUpload="beforeUpload">
            <a-button> <a-icon type="upload" /> 选取文件 </a-button>
          </a-upload>
          <a-progress
            v-if="loading"
            :strokeColor="{ from: '#108ee9', to: '#87d068' }"
            :percent="imageUploadPercent"
            status="active" />
        </a-form-item>
        <a-form-item label="镜像URL" v-bind="formItemLayout" v-if="!show">
          <a-input placeholder="请输入镜像URL" v-decorator="decorators.copy_from" />
        </a-form-item>
        <a-form-item label="操作系统" v-bind="formItemLayout" v-if="!show">
          <a-radio-group v-decorator="decorators.os_type">
            <a-radio-button value="Linux">
              Linux
            </a-radio-button>
            <a-radio-button value="windows">
              Windows Server
            </a-radio-button>
            <a-radio-button value="other">
              其它
            </a-radio-button>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import * as R from 'ramda'
import _ from 'lodash'
import { isRequired } from '@/utils/validate'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import DomainProject from '@/sections/DomainProject'
import i18n from '@/locales'

export default {
  name: 'ImageUploadDialog',
  components: {
    DomainProject,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        domain: [
          'domain',
          {
            rules: [
              { validator: isRequired(), message: i18n.t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        project: [
          'project',
          {
            rules: [
              { validator: isRequired(), message: i18n.t('rules.project'), trigger: 'change' },
            ],
          },
        ],
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请输入镜像名称' },
              { validator: this.$validate('imageName') },
              { validator: this.checkTemplateName },
            ],
          },
        ],
        uploadType: [
          'uploadType',
          {
            initialValue: 'file',
          },
        ],
        copy_from: [
          'copy_from',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请输入镜像URL' },
              { validator: this.validateUrl },
            ],
          },
        ],
        os_type: [
          'os_type',
          {
            initialValue: 'Linux',
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
      show: true,
      fileList: [],
      imageUploadPercent: 0,
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    headers () {
      return { 'Authorization': `Bearer ${this.$store.getters.userInfo.session}` }
    },
  },
  destroyed () {
    this.clearTimer()
  },
  methods: {
    clearTimer () {
      clearTimeout(this.timer)
      clearTimeout(this.percentTimer)
      this.timer = null
      this.percentTimer = null
    },
    beforeUpload (file) {
      this.fileList = [file]
      return false
    },
    handleUploadTypeChange (e) {
      if (e.target.value === 'url') {
        this.show = false
      } else {
        this.show = true
      }
    },
    handleUploadChange ({ file, fileList }) {
      this.fileList = fileList
    },
    checkTemplateName (rule, value, callback) {
      if (!value) {
        return callback(new Error('请输入镜像名称'))
      }
      return new this.$Manager('images', 'v1').list({ params: {
        name: value,
        scope: this.$store.getters.scope,
      } }).then(res => {
        const data = res.data.data
        if (!R.isNil(data) && !R.isEmpty(data)) {
          callback(new Error('输入的镜像名称已存在'))
        } else {
          callback()
        }
      })
    },
    validateUrl (rule, value, callback) {
      if (value.startsWith('http://') || value.startsWith('https://')) {
        callback()
      } else {
        callback(new Error('镜像URL必须以http:// 或者 https:// 开头。'))
      }
    },
    handleUpload (data) {
      return this.$http({
        url: '/v1/imageutils/upload',
        method: 'post',
        processData: false,
        data,
        timeout: 0,
      })
    },
    doImportUrl (data) {
      const params = {
        domain_id: (data.domain && data.domain.key) || this.userInfo.projectDomainId,
        project_id: (data.project && data.project.key) || this.userInfo.projectId,
        copy_from: data.copy_from,
        name: data.name,
        properties: {
          os_type: data.os_type,
          os_version: '',
        },
      }
      return this.params.onManager('create', {
        managerArgs: {
          data: params,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const { fileList } = this
        let formData = new FormData()
        const values = await this.form.fc.validateFields()
        formData.append('domain_id', (values.domain && values.domain.key) || this.userInfo.projectDomainId)
        formData.append('project_id', (values.project && values.project.key) || this.userInfo.projectId)
        if (values.uploadType === 'file') {
          formData.append('name', values.name)
          formData.append('os_version', '')
          if (fileList.length > 0) {
            formData.append('image_size', fileList[0].size)
            fileList.forEach(file => {
              formData.append('image', file.originFileObj)
            })
          } else {
            this.$message.error('请先选中要上传的镜像文件!')
            this.loading = false
            return false
          }
          this.handleUpload(formData)
            .then(() => {
              this.clearTimer()
              this.timer = setInterval(() => {
                this.fetchImageInfoByName()
                  .then((res) => {
                    const imageInfo = res.data && res.data.data && res.data.data[0]
                    if (this.fileList && this.fileList.length > 0) {
                      if (imageInfo) {
                        const percent = (imageInfo.size / this.fileList[0].size) * 100
                        if (percent === 100) {
                          this.percentTimer = setTimeout(() => {
                            this.imageUploadPercent = _.floor(percent)
                          }, 5000)
                        } else {
                          this.imageUploadPercent = _.floor(percent)
                        }
                      }
                    }
                    if (this.imageUploadPercent >= 100) {
                      this.cancelDialog()
                      this.params.refresh()
                    }
                  })
              }, 5000)
            })
            .catch(() => {
              this.loading = false
            })
        } else {
          await this.doImportUrl(values)
          this.cancelDialog()
          this.params.refresh()
        }
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    fetchImageInfoByName () {
      const imageManager = new this.$Manager('images', 'v1')
      const name = this.form.fc.getFieldValue('name')
      return imageManager.list({ params: { name } })
    },
  },
}
</script>
