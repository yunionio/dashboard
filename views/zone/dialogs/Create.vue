<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">新建可用区</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item label="名称" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" placeholder="请输入名称" />
        </a-form-item>
        <a-form-item label="区域" v-bind="formItemLayout">
          <base-select
            resource="cloudregions"
            v-decorator="decorators.region"
            :selectProps="{ 'placeholder': '请选择区域' }"
            :params="{ 'cloud_env': 'private_or_onpremise', 'brand': 'OneCloud' }" />
        </a-form-item>
        <a-form-item label="位置" v-bind="formItemLayout">
          <a-input v-decorator="decorators.location" placeholder="请输入位置、例如望京、酒仙桥等" />
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
  name: 'CreateZoneDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
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
        region: [
          'region',
          {
            rules: [
              { required: true, message: '请选择区域' },
            ],
          },
        ],
        location: [
          'location',
          {
            rules: [
              { required: true, message: '请输入位置' },
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
  methods: {
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
    doCreate (data) {
      return this.params.onManager('create', {
        managerArgs: {
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        this.loading = true
        await this.doCreate(values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
