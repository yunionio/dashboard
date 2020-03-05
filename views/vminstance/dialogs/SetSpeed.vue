<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item label="是否限速" v-bind="formItemLayout">
          <a-switch checkedChildren="开" unCheckedChildren="关" v-model="form.fi.isSetSpeed" />
        </a-form-item>
        <a-form-item label="最大IOPS" v-bind="formItemLayout" v-show="form.fi.isSetSpeed">
          <a-input-number :max="2048" :min="1" :step="50" v-decorator="decorators.bps" />
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
import _ from 'lodash'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'VmSetSpeedDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const bpsVal = _.get(this.params.data[0], 'metadata.bps')
    const bps = Boolean(parseInt(bpsVal))
    return {
      loading: false,
      action: '设置磁盘速度',
      form: {
        fc: this.$form.createForm(this),
        fi: {
          isSetSpeed: bps,
        },
      },
      decorators: {
        bps: [
          'bps',
          {
            initialValue: bps ? parseInt(bpsVal) : 1,
            rules: [
              { required: true, message: '请输入磁盘速度' },
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
    async doSetSpeedSubmit (data) {
      const params = {
        iops: 0,
        bps: this.form.fi.isSetSpeed ? data.bps : 0,
      }
      const ids = this.params.data.map(item => item.id)
      return this.params.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: ['running', 'ready'],
        managerArgs: {
          action: 'io-throttle',
          data: params,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.doSetSpeedSubmit(values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
