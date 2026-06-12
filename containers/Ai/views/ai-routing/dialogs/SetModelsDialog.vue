<template>
  <base-dialog :width="900" @cancel="cancelDialog">
    <div slot="header">{{ $t('aice.aiproxy.set_models') }}</div>
    <div slot="body">
      <a-spin :spinning="initializing">
        <template v-if="!initializing">
          <div v-for="(item, index) in models" :key="item._key">
            <model-binding-row :item="item" :index="index" @remove="removeModel" />
          </div>
          <a-button type="dashed" icon="plus" block @click="addModel">{{ $t('aice.aiproxy.add_model_binding') }}</a-button>
        </template>
      </a-spin>
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
import {
  PROVIDER_KIND_DEFAULT,
  buildRoutingModelBindings,
  fetchRoutingModelsForRouting,
} from '@Ai/utils/aiProviderKind'
import ModelBindingRow from '../components/ModelBindingRow'

const keySeqRef = { value: 0 }

export default {
  name: 'AiRoutingSetModelsDialog',
  components: { ModelBindingRow },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      initializing: true,
      models: [],
    }
  },
  created () {
    this.loadRoutingModels()
  },
  methods: {
    newModel () {
      return {
        _key: ++keySeqRef.value,
        provider_kind: PROVIDER_KIND_DEFAULT,
        ai_provider_id: '',
        ai_model_id: '',
        priority: 0,
      }
    },
    async loadRoutingModels () {
      const routing = this.params.data[0] || {}
      const routingId = routing.id
      try {
        let rows = Array.isArray(this.params.routingModels) ? this.params.routingModels : []
        if (!rows.length) {
          rows = routing.routing_models || []
        }
        if (!rows.length && routingId) {
          rows = await fetchRoutingModelsForRouting(routingId, this)
        }
        if (!rows.length) {
          this.models = [this.newModel()]
          return
        }
        const bindings = await buildRoutingModelBindings(rows, {
          vm: this,
          useCache: false,
          keySeqRef,
        })
        this.models = bindings
      } finally {
        this.initializing = false
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
