<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_1054')}}</div>
    <div slot="body">
      <a-form
        :form="form.fc"
        layout="vertical">
        <a-form-item :label="$t('compute.text_1051')" :extra="$t('compute.text_1055')">
          <a-input-number :min="1" :max="256" v-decorator="decorators.cpu_core_count" />{{$t('compute.text_167')}}</a-form-item>
        <a-form-item :label="$t('compute.text_1052')" :extra="$t('compute.text_1056')">
          <a-input-number :min="0.5" :max="512" v-decorator="decorators.memory_size_mb" /> GB
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
  name: 'CreateSkuDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        cpu_core_count: [
          'cpu_core_count',
          {
            initialValue: 4,
          },
        ],
        memory_size_mb: [
          'memory_size_mb',
          {
            initialValue: 16,
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 6,
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
    doCreate (data) {
      return this.params.onManager('create', {
        managerArgs: {
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        this.loading = true
        values.memory_size_mb = values.memory_size_mb * 1024
        await this.doCreate(values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
