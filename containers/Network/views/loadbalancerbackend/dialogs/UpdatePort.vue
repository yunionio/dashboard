<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('network.text_349')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.lb_backend')" :count="params.data.length" :action="$t('network.text_349')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item :label="$t('network.text_165')">
          <a-input-number :min="1" :max="65535" v-decorator="decorators.port" />
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
import expectStatus from '@/constants/expectStatus'

export default {
  name: 'BackendUpdatePortDialog',
  components: {
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        port: [
          'port',
          {
            initialValue: this.params.data[0].port,
            validateFirst: true,
            rules: [
              { type: 'integer', required: true, message: this.$t('network.text_350'), trigger: 'blur' },
              { type: 'integer', min: 1, max: 65535, message: this.$t('network.text_351'), trigger: 'blur' },
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
    doUpdate (id, data) {
      return this.params.onManager('update', {
        id,
        managerArgs: {
          data,
        },
        steadyStatus: {
          status: Object.values(expectStatus.lb).flat(),
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.doUpdate(this.params.data[0].id, values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
