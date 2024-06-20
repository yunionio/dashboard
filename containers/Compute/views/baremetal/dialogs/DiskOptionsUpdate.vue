<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item v-if="isConvert" :label="$t('compute.text_327')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" v-if="!isDisabled" class="workspace-prefix-wrapper">
            <span class="workspace-prefix" slot="prefix">{{prefix}}</span>
          </a-input>
          <a-input v-else :disabled="isDisabled" v-decorator="decorators.name" />
          <template #extra v-if="!isDisabled">
            {{$t('compute.text_1361', ['/opt/cloud/workspace'])}}
          </template>
        </a-form-item>
        <a-form-item v-else :label="$t('compute.text_327')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" :disabled="isDisabled" />
          <template #extra v-if="!isDisabled">
            {{$t('compute.mount_point_tips', ['/opt/cloud/workspace'])}}
          </template>
        </a-form-item>
        <a-form-item :label="$t('compute.text_328')" v-bind="formItemLayout" v-if="!isDisabled">
          <a-select v-decorator="decorators.format" :placeholder="$t('compute.text_329')">
            <a-select-option value="ext4">ext4</a-select-option>
            <a-select-option value="xfs">xfs</a-select-option>
            <a-select-option value="ntfs">ntfs</a-select-option>
            <a-select-option value="swap">swap</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('compute.text_330')" v-bind="formItemLayout">
          <a-radio-group v-decorator="decorators.method" @change="handleMethodChange">
            <a-radio value="autoextend" v-show="this.params.item.remainder !== 0">{{$t('compute.text_331')}}</a-radio>
            <a-radio value="manual">{{$t('compute.text_332')}}</a-radio>
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
    const prefix = '/opt/cloud/workspace'
    const nameValue = this.params.selectedArea.name.replace(prefix, '')
    const isConvert = this.params.type === 'Convert'
    const initNameValue = this.params.title === this.$t('compute.text_318') ? this.params.selectedArea.name : '/opt/cloud/workspace'
    const initConvertNameValue = this.params.title === this.$t('compute.text_318') ? nameValue : ''

    return {
      loading: false,
      prefix,
      formItemLayout: {
        wrapperCol: {
          span: 16,
        },
        labelCol: {
          span: 4,
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
            initialValue: isConvert ? initConvertNameValue : initNameValue,
            validateTrigger: ['change', 'blur'],
            validateFirst: true,
            rules: [
              { required: !isConvert, message: this.$t('compute.text_333') },
              { validator: isConvert ? this.checkConvertMountpoint : this.checkMountpoint },
            ],
          },
        ],
        format: [
          'format',
          {
            initialValue: this.params.title === this.$t('compute.text_318') ? this.params.selectedArea.format : 'ext4',
            rules: [
              { required: true, message: this.$t('compute.text_329') },
            ],
          },
        ],
        method: [
          'method',
          {
            initialValue: this.params.title === this.$t('compute.text_317') ? 'autoextend' : 'manual',
            rules: [
              { required: true },
            ],
          },
        ],
        size: [
          'size',
          {
            initialValue: this.params.title === this.$t('compute.text_318') ? this.params.selectedArea.size : 1,
            rules: [
              { required: true },
            ],
          },
        ],
      },
      isManual: this.params.title !== this.$t('compute.text_317'),
    }
  },
  computed: {
    maxNumber () {
      if (this.params.title === this.$t('compute.text_318')) {
        return this.params.item.remainder + this.params.selectedArea.size
      }
      return this.params.item.remainder
    },
    coutTitle () {
      if (this.params.title === this.$t('compute.text_318')) {
        return this.$t('compute.text_334', [this.params.item.remainder + this.params.selectedArea.size])
      }
      return this.$t('compute.text_334', [this.params.item.remainder])
    },
    selectedAreaName () {
      return this.params.selectedArea.name.replace(this.prefix, '')
    },
    isConvert () {
      return this.params.type === 'Convert'
    },
    isSystem () {
      return this.selectedAreaName === this.$t('compute.text_316')
    },
    isDisabled () {
      if (this.params.title === this.$t('compute.text_318') && this.isSystem) {
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
    checkConvertMountpoint (rule, value, callback) {
      const pathReg = new RegExp('^(/[^/ ]*)+')
      const checkName = this.params.nameArr.filter(item => item.name === `${this.prefix}${value}`)
      if (this.params.title === this.$t('compute.text_317') && checkName.length > 0) {
        callback(new Error(this.$t('compute.text_337')))
      }
      if (value) {
        if (!pathReg.test(value)) {
          callback(new Error(this.$t('compute.text_335')))
        }
        const checkName = this.params.nameArr.filter(item => item.name === `${this.prefix}${value}`)
        if (this.params.title === this.$t('compute.text_318') && checkName.length > 1) {
          callback(new Error(this.$t('compute.text_337')))
        }
      }
      callback()
    },
    checkMountpoint (rule, value, callback) {
      const pathReg = new RegExp('^(/[^/ ]*)+')
      if (!pathReg.test(value)) {
        callback(new Error(this.$t('compute.text_335')))
      }
      const checkName = this.params.nameArr.filter(item => item.name === value)
      if (this.params.title === this.$t('compute.text_318') && checkName.length > 1) {
        callback(new Error(this.$t('compute.text_337')))
      }
      if (this.params.title === this.$t('compute.text_317') && checkName.length > 0) {
        callback(new Error(this.$t('compute.text_337')))
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
      if (values.method === 'autoextend' && this.params.title === this.$t('compute.text_317')) {
        values = {
          ...values,
          size: this.params.item.remainder,
        }
      }
      if (values.method === 'autoextend' && this.params.title === this.$t('compute.text_318')) {
        values = {
          ...values,
          size: this.params.item.remainder + this.params.selectedArea.size,
        }
      }
      if (this.isConvert) {
        values.name = this.isDisabled ? values.name : `${this.prefix}${values.name}`
      }
      this.params.updateData(values)
      this.cancelDialog()
    },
  },
}
</script>

<style lang="scss">
.ant-input-affix-wrapper.workspace-prefix-wrapper {
  .ant-input:not(:first-child) {
    padding-left: 143px;
  }
}
</style>
