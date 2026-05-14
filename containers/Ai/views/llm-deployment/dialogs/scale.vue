<template>
  <base-dialog :width="600" @cancel="cancelDialog">
    <div slot="header">{{ $t('aice.llm_deployment.scale') }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('aice.llm_deployment')" :count="params.data.length" :action="$t('aice.llm_deployment.scale')" />
      <a-form-model ref="form" :model="form" :rules="rules" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-model-item :label="$t('aice.llm_deployment.replicas')" prop="replicas">
          <a-input-number v-model="form.replicas" :min="0" :max="100" />
          <div class="text-color-help">
            {{ $t('aice.llm_deployment.scale.help', [params.data[0].ready_replicas || 0, params.data[0].replicas || 0]) }}
          </div>
        </a-form-model-item>
      </a-form-model>
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
  name: 'LlmDeploymentScaleDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const current = this.params.data[0] || {}
    return {
      loading: false,
      form: {
        replicas: current.replicas || 1,
      },
      rules: {
        replicas: [{ required: true, message: this.$t('common.tips.input', [this.$t('aice.llm_deployment.replicas')]) }],
      },
    }
  },
  methods: {
    async handleConfirm () {
      try {
        this.loading = true
        await this.$refs.form.validate()
        await this.params.onManager('update', {
          id: this.params.data[0].id,
          managerArgs: {
            data: { replicas: this.form.replicas },
          },
        })
        this.cancelDialog()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
