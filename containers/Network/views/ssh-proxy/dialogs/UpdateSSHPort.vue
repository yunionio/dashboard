<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('network.text_349')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('network.ssh-proxy.endpoints')" :count="params.data.length" :action="$t('network.text_349')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 4)" />
      <a-form :form="form">
        <a-form-item :label="$t('network.ssh-proxy.port')" v-bind="formItemLayout">
          <a-input-number v-decorator="decorators.port" />
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
  name: 'UpdateSSHPortDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    let defaultPort = 22
    if (this.params.data) {
      if (this.params.data.length === 1) {
        defaultPort = this.params.data[0].port || 22
      } else if (this.params.data.length > 1) {
        defaultPort = null
      }
    }

    return {
      loading: false,
      scope: this.$store.getters.scope,
      form: this.$form.createForm(this),
      decorators: {
        port: [
          'port',
          {
            initialValue: defaultPort,
            rules: [
              { required: true, message: this.$t('network.text_176') },
              { type: 'number', min: 1, max: 65535, message: this.$t('network.text_347') },
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
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.validateFields()
        const ids = this.params.data.map(item => item.id)
        await this.params.onManager('batchUpdate', {
          id: ids,
          managerArgs: {
            data: values,
          },
        })
        this.params.refresh && this.params.refresh()
        this.cancelDialog()
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>

</style>
