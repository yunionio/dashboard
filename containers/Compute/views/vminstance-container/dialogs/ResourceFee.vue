<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_1117')}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <div slot="message">{{$t('compute.text_1389')}}</div>
      </a-alert>
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="$t('compute.text_1117')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('compute.text_1230')" v-bind="formItemLayout">
          <a-radio-group v-decorator="decorators.buyDuration">
            <a-radio-button
              v-for="i in options.buyDurations"
              :key="i.value"
              :value="i.value">
              {{ i.label }}
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
import { BUY_DURATIONS_OPTIONS as buyDurations } from '@Compute/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'VmResourceFeeDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        buyDuration: [
          'buyDuration',
          {
            rules: [
              { required: true, message: this.$t('compute.text_1231'), trigger: 'change' },
            ],
            initialValue: '1M',
          },
        ],
      },
      options: {
        buyDurations,
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
    doResourceFeeSubmit (data) {
      const selectedIds = this.params.data.map(item => item.id)
      return new this.$Manager('servers').batchPerformAction({
        ids: selectedIds,
        action: 'renew',
        data: {
          duration: data.buyDuration,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        await this.doResourceFeeSubmit(values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
