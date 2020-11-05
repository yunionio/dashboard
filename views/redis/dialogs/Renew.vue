<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.elasticcaches')" :count="params.data.length" :action="params.title" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc">
        <a-form-item :label="$t('db.text_54')" v-bind="formItemLayout">
          <a-radio-group v-decorator="['duration', {initialValue: (params.data && params.data.length > 0) ? (params.data[0].duration || '1M') : '1M' }]">
              <a-radio-button
                :key="item.value"
                :value="item.value"
                v-for="item in BUY_DURATIONS_OPTIONS">
                {{item.label}}</a-radio-button>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button :loading="loading" @click="handleConfirm" type="primary">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { BUY_DURATIONS_OPTIONS } from '../constants/index.js'
import { CreateServerForm } from '@Compute/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'RedisRenewDialog',
  mixins: [DialogMixin, WindowsMixin],
  provide () {
    return {
      form: this.form,
    }
  },
  data () {
    return {
      BUY_DURATIONS_OPTIONS,
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: { span: CreateServerForm.wrapperCol },
        labelCol: { span: CreateServerForm.labelCol },
      },
      decorators: {
        boot_order: [
          'boot_order',
          {
            rules: [
              { required: true, message: this.$t('db.text_148') },
            ],
          },
        ],
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
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        const ids = this.params.data.map(item => item.id)
        await this.params.onManager('batchUpdate', {
          id: ids,
          steadyStatus: 'running',
          managerArgs: {
            data: values,
          },
        })
        this.loading = false
        this.$message.success(this.$t('db.text_149'))
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
