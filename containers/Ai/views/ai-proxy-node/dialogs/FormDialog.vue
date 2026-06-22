<template>
  <base-dialog :width="720" @cancel="cancelDialog">
    <div slot="header">{{ $t('table.action.modify') }}</div>
    <div slot="body">
      <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
        <a-form-model-item :label="$t('common.name')" prop="name">
          <a-input v-model="form.name" disabled />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.address')" prop="address">
          <a-input v-model="form.address" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.access_address')" prop="access_address">
          <a-input v-model="form.access_address" placeholder="https://gateway.example.com:443" />
        </a-form-model-item>
        <a-form-model-item :label="$t('aice.aiproxy.hb_timeout')" prop="hb_timeout">
          <a-input-number v-model="form.hb_timeout" :min="1" />
        </a-form-model-item>
      </a-form-model>
    </div>
    <div slot="footer">
      <a-button type="primary" :loading="loading" @click="handleConfirm">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { validateModelForm } from '@/utils/validate'

export default {
  name: 'AiProxyNodeFormDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const data = this.params.data[0] || {}
    return {
      loading: false,
      form: {
        name: data.name,
        address: data.address || '',
        access_address: data.access_address || '',
        hb_timeout: data.hb_timeout || 60,
      },
      rules: {
        address: [{ required: true, message: this.$t('common.tips.input', [this.$t('aice.aiproxy.address')]) }],
      },
    }
  },
  methods: {
    async handleConfirm () {
      await validateModelForm(this.$refs.form)
      this.loading = true
      try {
        await this.params.onManager('update', {
          id: this.params.data[0].id,
          managerArgs: { data: this.form },
        })
        this.cancelDialog()
        this.params.refresh()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
