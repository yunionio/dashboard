<template>
  <base-dialog :width="900" @cancel="cancelDialog">
    <div slot="header">{{ $t('aice.aiproxy.set_models') }}</div>
    <div slot="body">
      <div v-for="(item, index) in models" :key="item._key">
        <model-binding-row :item="item" :index="index" @remove="removeModel" />
      </div>
      <a-button type="dashed" icon="plus" block @click="addModel">{{ $t('aice.aiproxy.add_model_binding') }}</a-button>
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
import ModelBindingRow from '../components/ModelBindingRow'

let keySeq = 0

export default {
  name: 'AiRoutingSetModelsDialog',
  components: { ModelBindingRow },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const routing = this.params.data[0] || {}
    const initial = (routing.routing_models || []).map(m => ({
      _key: ++keySeq,
      ai_provider_id: m.ai_provider_id || '',
      ai_model_id: m.ai_model_id || '',
      priority: m.priority || 0,
      model_pattern: m.model_pattern || '',
      llm_id: m.llm_id || '',
    }))
    return {
      loading: false,
      models: initial.length ? initial : [this.newModel()],
    }
  },
  methods: {
    newModel () {
      return {
        _key: ++keySeq,
        ai_provider_id: '',
        ai_model_id: '',
        priority: 0,
        model_pattern: '',
        llm_id: '',
      }
    },
    addModel () {
      this.models.push(this.newModel())
    },
    removeModel (index) {
      this.models.splice(index, 1)
    },
    buildModelsPayload () {
      return this.models
        .filter(m => m.ai_provider_id && m.ai_model_id)
        .map(m => ({
          ai_provider_id: m.ai_provider_id,
          ai_model_id: m.ai_model_id,
          priority: m.priority || 0,
          model_pattern: m.model_pattern || undefined,
          llm_id: m.llm_id || undefined,
        }))
    },
    async handleConfirm () {
      const models = this.buildModelsPayload()
      if (!models.length) {
        this.$message.warning(this.$t('aice.aiproxy.models_required'))
        return
      }
      this.loading = true
      try {
        await this.params.onManager('performAction', {
          id: this.params.data[0].id,
          steadyStatus: [''],
          managerArgs: {
            action: 'set-models',
            data: { models },
          },
        })
        this.cancelDialog()
        this.params.refresh && this.params.refresh()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
