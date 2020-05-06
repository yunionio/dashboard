<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">设置二层网络</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" action="设置二层网络" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item label="二层网络" v-bind="formItemLayout">
          <base-select
            :filterable="true"
            v-decorator="decorators.wire"
            resource="wires"
            version="v1"
            :select-props="{ placeholder: '选择二层网络' }" />
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
          span: 21,
        },
        labelCol: {
          span: 3,
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
          mac: this.params.data[0]['mac'],
          index: this.params.data[0]['index'],
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        let values = this.form.fc.validateFields()
        this.loading = true
        await this.doUpdate(values)
        this.loading = false
        this.cancelDialog()
        this.params.list.refresh()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
