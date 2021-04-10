<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_843')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.physicalmachine')" :count="params.data.length" :action="$t('compute.text_843')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('compute.text_844')" v-bind="formItemLayout">
          <base-select
            :filterable="true"
            v-decorator="decorators.wire"
            resource="wires"
            version="v1"
            :select-props="{ placeholder: $t('compute.text_845') }" />
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
  name: 'HostSetWireDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        wire: [
          'wire',
          {
            rules: [
              { required: true },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
    }
  },
  methods: {
    doUpdate (data) {
      return new this.$Manager('hosts').performAction({
        action: 'add-netif',
        id: this.params.data[0].hostId,
        data: {
          ...data,
          mac: this.params.data[0].mac,
          index: this.params.data[0].index,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = this.form.fc.validateFields()
        this.loading = true
        await this.doUpdate(values)
        this.loading = false
        this.cancelDialog()
        this.params.refresh()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
