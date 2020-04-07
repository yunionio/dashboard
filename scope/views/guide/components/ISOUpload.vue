<template>
  <div>
    <a-form-item label="镜像名称">
      <a-input v-decorator="decorators.name" placeholder="镜像名称" />
    </a-form-item>
    <a-form-item label="操作系统">
      <a-radio-group v-decorator="decorators.os_type">
        <a-radio-button v-for="(v, k) in $t('osTypes')" :value="k" :key="k">{{v}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="发行版">
      <a-input v-decorator="decorators.os_distribution" placeholder="例如: CentOS" />
    </a-form-item>
    <a-form-item label="版本号">
      <a-input v-decorator="decorators.os_version" placeholder="例如: 7.3.1611" />
    </a-form-item>
    <a-form-item label="系统架构">
      <a-radio-group v-decorator="decorators.os_arch">
        <a-radio-button v-for="(v, k) in $t('archTypes')" :value="k" :key="k">{{v}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="上传方式">
      <a-radio-group v-model="uploadType">
        <a-radio-button v-for="(v, k) in $t('isoUploadTypes')" :value="k" :key="k">{{v}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item label="镜像文件" v-if="uploadType === 'file'">
      <a-upload
        @change="handleUploadChange"
        :fileList="fileList"
        :beforeUpload="beforeUpload">
        <a-button> <a-icon type="upload" /> 选取文件 </a-button>
      </a-upload>
    </a-form-item>
    <a-form-item label="镜像URL" v-if="uploadType === 'url'">
      <a-input placeholder="请输入镜像URL" v-decorator="decorators.copy_from" />
    </a-form-item>
  </div>
</template>

<script>
export default {
  name: 'ISOUpload',
  data () {
    return {
      uploadType: 'file',
      fileList: [],
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请输入名称' },
              // { validator: this.$validate('resourceName') },
            ],
          },
        ],
        os_type: [
          'os_type',
          {
            initialValue: 'Linux',
          },
        ],
        os_distribution: [
          'os_distribution',
        ],
        os_version: [
          'os_version',
        ],
        os_arch: [
          'os_arch',
          {
            initialValue: '',
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
      },
    }
  },
  methods: {
    validateUrl (rule, value, callback) {
      if (value.startsWith('http://') || value.startsWith('https://')) {
        callback()
      } else {
        callback(new Error('镜像URL必须以http:// 或者 https:// 开头。'))
      }
    },
    beforeUpload (file) {
      this.fileList = [file]
      return false
    },
    handleUploadChange ({ file, fileList }) {
      this.fileList = [file]
    },
    async postFile (values) {
      const file = this.fileList[0]
      const allData = {
        name: values.name,
        os_type: values.os_type,
        os_distribution: values.os_distribution,
        os_version: values.os_version,
        os_arch: values.os_arch,
        image_size: file.size,
        image: file,
      }
      const fd = new FormData()
      for (let key in allData) {
        if (allData[key]) {
          fd.append(key, allData[key])
        }
      }
      await this.$http({
        url: '/v1/imageutils/upload',
        method: 'post',
        processData: false,
        data: fd,
        timeout: 0,
      })
    },
    async postUrl (data) {
      const params = {
        copy_from: data.copy_from,
        name: data.name,
        properties: {
          os_type: data.os_type,
          os_version: '',
        },
      }
      const manager = new this.$Manager('images', 'v1')
      await manager.create({
        data: params,
      })
    },
    async doSubmit (fc) {
      if (this.uploadType === 'file' && (!this.fileList || !this.fileList.length)) {
        this.$message.error('请先选中要上传的镜像文件!')
        return false
      }
      try {
        const values = await fc.validateFields(['name', 'os_type', 'os_distribution', 'os_version', 'image_size', 'image', 'os_arch', 'copy_from'])
        if (this.uploadType === 'file') {
          await this.postFile(values)
        } else {
          await this.postUrl(values)
        }
      } catch (err) {
        throw err
      }
    },
  },
}
</script>
