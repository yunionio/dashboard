<template>
  <div>
    <a-row :gutter="8" class="mb-2">
      <a-col :span="8">
        <base-select
          v-model="item.ai_provider_id"
          resource="ai_providers"
          :params="aiproxySelectParams('ai_providers')"
          filterable
          version="v2"
          @change="() => onProviderChange(item)" />
      </a-col>
      <a-col :span="8">
        <base-select
          v-model="item.ai_model_id"
          resource="ai_models"
          :params="modelParams(item)"
          filterable
          version="v2"
          need-params />
      </a-col>
      <a-col :span="4">
        <a-input-number v-model="item.priority" :min="0" :placeholder="$t('aice.aiproxy.priority')" style="width:100%" />
      </a-col>
      <a-col :span="4">
        <a-button shape="circle" icon="minus" size="small" @click="$emit('remove', index)" />
      </a-col>
    </a-row>
    <a-row :gutter="8" class="mb-3">
      <a-col :span="16">
        <a-input v-model="item.model_pattern" :placeholder="$t('aice.aiproxy.model_pattern')" />
      </a-col>
      <a-col :span="8">
        <a-input v-model="item.llm_id" :placeholder="$t('aice.aiproxy.llm_id')" />
      </a-col>
    </a-row>
  </div>
</template>

<script>
import { getAiproxySelectParams } from '@Ai/constants/aiproxyResources'

export default {
  name: 'AiRoutingModelBindingRow',
  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
  },
  methods: {
    modelParams (item) {
      const params = getAiproxySelectParams(this, 'ai_models')
      if (item.ai_provider_id) params.ai_provider_id = item.ai_provider_id
      return params
    },
    onProviderChange (item) {
      item.ai_model_id = ''
    },
    aiproxySelectParams (resource, extra) {
      return getAiproxySelectParams(this, resource, extra)
    },
  },
}
</script>
