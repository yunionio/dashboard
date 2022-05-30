<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        v-bind="formItemLayout"
        :form="form.fc">
        <a-form-item :label="$t('compute.text_1247')">
          <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-model="form.fi.isSetSpeed" />
        </a-form-item>
        <a-form-item v-show="form.fi.isSetSpeed">
          <span slot="label">
            {{ $t('compute.text_1248') }}&nbsp;
            <a-tooltip :title="$t('compute.text_1248_tip')">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <span>
            <a-input-number :min="1" :step="50" v-decorator="decorators.iops" />
          </span>
        </a-form-item>
        <a-form-item v-show="form.fi.isSetSpeed">
          <span slot="label">
            {{ $t('compute.text_1248_1') }}&nbsp;
            <a-tooltip :title="$t('compute.text_1248_1_tip')">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <span>
            <a-input-number :min="1" :step="50" v-decorator="decorators.bps" />
          </span>
          <span class="ml-2">M/s</span>
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
    const iopsVal = _.get(this.params.data[0], 'metadata.iops')
    const iops = Boolean(parseInt(iopsVal))
    return {
      loading: false,
      action: this.$t('compute.text_1249'),
      form: {
        fc: this.$form.createForm(this),
        fi: {
          isSetSpeed: bps,
        },
      },
      decorators: {
        iops: [
          'iops',
          {
            initialValue: iops ? parseInt(iopsVal) : 1,
            rules: [
              { required: true, message: this.$t('compute.text_1250') },
            ],
          },
        ],
        bps: [
          'bps',
          {
            initialValue: bps ? parseInt(bpsVal) : 1,
            rules: [
              { required: true, message: this.$t('compute.text_1250_1') },
            ],
          },
        ],
        unit: [
          'unit',
          {
            initialValue: 'M',
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 19,
        },
        labelCol: {
          span: 4,
        },
      },
    }
  },
  methods: {
    async doSetSpeedSubmit (data) {
      const params = { iops: 0, bps: 0 }
      if (this.form.fi.isSetSpeed) {
        params.bps = data.bps
        params.iops = data.iops
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
