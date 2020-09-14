<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('network.text_220')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.eip')" :count="params.data.length" :action="$t('network.text_220')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('network.text_195')" v-bind="formItemLayout">
          <a-input-number v-if="isOneCloud" style="width: 120px" :precision="0" :min="1" v-decorator="decorators.bandwidth" />
          <a-tooltip v-else placement="top" :title="$t('network.eip.text_725', [maxBandwidth])">
            <a-input-number style="width: 120px" :precision="0" :min="1" :max="200" v-decorator="decorators.bandwidth" />
          </a-tooltip>
          <span class="ml-2">Mbps</span>
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
  name: 'EipUpdateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        bandwidth: [
          'bandwidth',
          {
            initialValue: this.params.data[0].bandwidth || 30,
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
  computed: {
    isOneCloud () {
      return this.params.data[0].provider === 'OneCloud'
    },
    maxBandwidth () {
      const eipItem = this.params.data[0]
      let maxBandwidth = 200
      const isBandwidth = eipItem.charge_type === 'bandwidth'
      if (eipItem.provider === 'Huawei') {
        maxBandwidth = isBandwidth ? 2000 : 300
      }
      if (eipItem.provider === 'Aliyun') {
        maxBandwidth = 500
      }
      return maxBandwidth
    },
  },
  methods: {
    doUpdate (data) {
      return this.params.onManager('performAction', {
        id: data.id,
        managerArgs: {
          action: 'change-bandwidth',
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        let values = await this.form.fc.validateFields()
        values = {
          ...values,
          id: this.params.data[0].id,
        }
        await this.doUpdate(values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
