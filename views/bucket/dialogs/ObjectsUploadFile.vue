<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body">
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item label="上传至">
          {{uploadTo}}
        </a-form-item>
        <a-form-item label="选择文件">
          <a-upload-dragger
            v-decorator="decorators.files"
            v-bind="uploadDraggerConfig"
            :fileList="fileList">
            <div style="padding: 10px; min-width: 600px">
              <p class="ant-upload-drag-icon">
              <a-icon type="inbox" />
            </p>
             <p class="ant-upload-text">可将多个文件拖拽到此处，或点击 <a>直接上传</a></p>
              <p class="ant-upload-hint">
                最多支持 <span class="warning-color">4</span> 个文件同时上传
              </p>
            </div>
          </a-upload-dragger>
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button :disabled="loading" @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { formItemLayout } from '@Storage/constants/index.js'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ObjectsUploadFileDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      formItemLayout,
      fileList: [],
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        files: ['files', {
          rules: [
            { required: true, message: '请选择上传文件' },
          ],
        }],
      },
    }
  },
  provide () {
    return {
      form: this.form,
    }
  },
  computed: {
    uploadTo () {
      const { resItem, prefix } = this.params
      console.log(prefix)
      return `oss://${resItem.name}/${prefix}`
    },
    uploadDraggerConfig () {
      return {
        name: 'file',
        multiple: true,
        // action: '/api/v1/s3uploads',
        headers: {
          'Authorization': `Bearer ${this.$store.getters.userInfo.session}`,
        },
        beforeUpload: (file, fileList) => {
          if (this.fileList.length >= 4) {
            // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            this.fileList.shift()
          }
          // eslint-disable-next-line vue/no-side-effects-in-computed-properties
          this.fileList.push(file)
          return false
        },
      }
    },
  },
  methods: {
    postUpload (formData) {
      return this.$http({
        url: '/v1/s3uploads',
        method: 'post',
        processData: false,
        data: formData,
        timeout: 0,
      })
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (err) return reject(err)
          const { resId, prefix } = this.params
          const formDatas = []
          this.fileList.map(file => {
            const { name, size } = file
            const _ = {
              bucket_id: resId,
              fileName: name,
              key: `${prefix}${name}`,
              content_length: size,
              acl: 'private',
              file,
            }
            formDatas.push(_)
          })
          resolve(formDatas)
        })
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const formDatas = await this.validateForm()
        for (let i = 0; i < formDatas.length; i++) {
          const formData = new FormData()
          Object.keys(formDatas[i]).forEach(k => {
            formData.append(k, formDatas[i][k])
          })
          await this.postUpload(formData)
        }
        this.params.list.fetchData()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
