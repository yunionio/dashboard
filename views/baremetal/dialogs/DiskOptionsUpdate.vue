<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item label="挂载点" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" :disabled="isDisabled" />
        </a-form-item>
        <a-form-item label="分区格式" v-bind="formItemLayout" v-if="!isDisabled">
          <a-select v-decorator="decorators.format" placeholder="请选择分区格式">
            <a-select-option value="ext4">ext4</a-select-option>
            <a-select-option value="xfs">xfs</a-select-option>
            <a-select-option value="ntfs">ntfs</a-select-option>
            <a-select-option value="swap">swap</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="分区大小" v-bind="formItemLayout">
          <a-radio-group v-decorator="decorators.method" @change="handleMethodChange">
            <a-radio value="autoextend" v-show="this.params.item.remainder !== 0">最大容量</a-radio>
            <a-radio value="manual">手动输入</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-bind="tailFormItemLayout" v-if="isManual">
          <a-tooltip :title="coutTitle">
            <a-input-number
              v-decorator="decorators.size"
              :min="1"
              :max="maxNumber"
              :formatter="value => `${value}G`"
              :parser="value => value.replace('G', '')" />
          </a-tooltip>
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
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'DiskOptionsUpdateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      formItemLayout: {
        wrapperCol: {
          span: 8,
        },
        labelCol: {
          span: 3,
        },
      },
      tailFormItemLayout: {
        wrapperCol: {
          sm: {
            span: 8,
            offset: 3,
          },
        },
      },
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        name: [
          'name',
          {
            initialValue: this.params.title === '更新分区' ? this.params.selectedArea.name : '',
            validateTrigger: ['change', 'blur'],
            validateFirst: true,
            rules: [
              { required: true, message: '请填写名称' },
              { validator: this.checkMountpoint },
            ],
          },
        ],
        format: [
          'format',
          {
            initialValue: this.params.title === '更新分区' ? this.params.selectedArea.format : 'ext4',
            rules: [
              { required: true, message: '请选择分区格式' },
            ],
          },
        ],
        method: [
          'method',
          {
            initialValue: this.params.title === '创建新分区' ? 'autoextend' : 'manual',
            rules: [
              { required: true },
            ],
          },
        ],
        size: [
          'size',
          {
            initialValue: this.params.title === '更新分区' ? this.params.selectedArea.size : 1,
            rules: [
              { required: true },
            ],
          },
        ],
      },
      isManual: this.params.title !== '创建新分区',
    }
  },
  computed: {
    maxNumber () {
      if (this.params.title === '更新分区') {
        return this.params.item.remainder + this.params.selectedArea.size
      }
      return this.params.item.remainder
    },
    coutTitle () {
      if (this.params.title === '更新分区') {
        return `最小:1GB 最大:${this.params.item.remainder + this.params.selectedArea.size}GB`
      }
      return `最小:1GB 最大:${this.params.item.remainder}GB`
    },
    isDisabled () {
      if (this.params.title === '更新分区' && this.params.selectedArea.name === '/(系统)') {
        return true
      }
      return false
    },
  },
  methods: {
    handleMethodChange (e) {
      if (e.target.value === 'autoextend') {
        this.isManual = false
      } else {
        this.isManual = true
      }
    },
    checkMountpoint (rule, value, callback) {
      const pathReg = new RegExp('^(/[^/ ]*)+')
      if (!pathReg.test(value)) {
        callback(new Error('挂载点必须以"/"头'))
      }
      const checkName = this.params.nameArr.filter(item => item.name === value)
      if (this.params.title === '更新分区' && checkName.length > 1) {
        callback(new Error('名称已经存在'))
      }
      if (this.params.title === '创建新分区' && checkName.length > 0) {
        callback(new Error('名称已经存在'))
      }
      callback()
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    async handleConfirm () {
      let values = await this.validateForm()
      if (values.method === 'autoextend' && this.params.title === '创建新分区') {
        values = {
          ...values,
          size: this.params.item.remainder,
        }
      }
      if (values.method === 'autoextend' && this.params.title === '更新分区') {
        values = {
          ...values,
          size: this.params.item.remainder + this.params.selectedArea.size,
        }
      }
      this.params.updateData(values)
      this.cancelDialog()
    },
  },
}
</script>
