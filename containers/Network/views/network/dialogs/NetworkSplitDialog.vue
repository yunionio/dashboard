<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('network.text_632')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.network')" :count="params.data.length" :action="$t('network.text_632')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('network.text_633')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" :placeholer="$t('network.text_634')" />
        </a-form-item>
        <a-form-item :label="$t('network.text_635')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.split_ip" :placeholer="$t('network.text_636')" />
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
  name: 'NetworkSplitDialog',
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
            rules: [
              { required: true, message: this.$t('network.text_637') },
            ],
          },
        ],
        split_ip: [
          'split_ip',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('network.text_638') },
              { validator: this.$validate('IPv4') },
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
    doSplit (data) {
      return this.params.onManager('performAction', {
        id: this.params.data[0].id,
        managerArgs: {
          action: 'split',
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        if (values.split_ip === this.params.data[0].guest_ip_start || values.split_ip === this.params.data[0].guest_ip_end) {
          this.$message.error(this.$t('network.text_639'))
          return
        }
        this.loading = true
        await this.doSplit(values)
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
