<template>
  <div>
    <a-row :gutter="8" class="mb-1 text-color-secondary routing-binding-labels">
      <a-col :span="5">{{ $t('aice.aiproxy.provider_kind') }}</a-col>
      <a-col :span="7">{{ providerFieldLabel }}</a-col>
      <a-col :span="7">{{ $t('aice.aiproxy.model') }}</a-col>
      <a-col :span="3">{{ $t('aice.aiproxy.priority') }}</a-col>
      <a-col :span="2" />
    </a-row>
    <a-row :gutter="8" class="mb-2" type="flex" align="middle">
      <a-col :span="5">
        <a-select
          v-model="item.provider_kind"
          :options="providerKindOptions"
          :placeholder="$t('aice.aiproxy.routing_binding_provider_kind_placeholder')"
          style="width: 100%"
          @change="() => onProviderKindChange(item)" />
      </a-col>
      <a-col :span="7">
        <base-select
          :key="`provider-${item._key}-${item.provider_kind}`"
          v-model="item.ai_provider_id"
          resource="ai_providers"
          :params="providerParams(item)"
          :extra-opts="providerExtraOpts(item)"
          :select-props="{ placeholder: providerPlaceholder(item) }"
          :label-format="providerLabelFormat"
          option-label-prop="label"
          filterable
          version="v2"
          need-params
          @change="() => onProviderChange(item)">
          <template #optionLabelTemplate="{ item: providerItem }">
            <aiproxy-provider-label
              v-if="providerOptionKey(providerItem)"
              :provider-key="providerOptionKey(providerItem)"
              :label="providerOptionLabel(providerItem)"
              prefer-label
              :icon-size="16" />
            <span v-else>{{ providerOptionLabel(providerItem) }}</span>
          </template>
        </base-select>
      </a-col>
      <a-col :span="7">
        <base-select
          :key="`model-${item._key}-${item.ai_provider_id}`"
          v-model="item.ai_model_id"
          resource="ai_models"
          :params="modelParams(item)"
          :extra-opts="modelExtraOpts(item)"
          :select-props="modelSelectProps(item)"
          :label-format="modelLabelFormat"
          filterable
          version="v2"
          need-params
          :disabled="!item.ai_provider_id"
          @update:item="modelItem => onModelItemSelected(item, modelItem)"
          @change="() => onModelChange(item)" />
      </a-col>
      <a-col :span="3">
        <a-input-number
          v-model="item.priority"
          :min="0"
          :placeholder="$t('aice.aiproxy.routing_binding_priority_placeholder')"
          style="width:100%" />
      </a-col>
      <a-col :span="2">
        <a-button shape="circle" icon="minus" size="small" @click="$emit('remove', index)" />
      </a-col>
    </a-row>
  </div>
</template>

<script>
import AiproxyProviderLabel from '@Ai/components/AiproxyProviderLabel'
import { getAiproxySelectParams } from '@Ai/constants/aiproxyResources'
import {
  PROVIDER_KIND_DEFAULT,
  PROVIDER_KIND_DEPLOYMENT,
  deploymentProviderLabelFormat,
  getProviderSelectParams,
  providerKindOptions,
} from '@Ai/utils/aiProviderKind'

export default {
  name: 'AiRoutingModelBindingRow',
  components: { AiproxyProviderLabel },
  props: {
    item: { type: Object, required: true },
    index: { type: Number, required: true },
  },
  computed: {
    providerKindOptions () {
      return providerKindOptions(this)
    },
    providerFieldLabel () {
      return this.isDeploymentKind(this.item)
        ? this.$t('aice.aiproxy.provider_kind.deployment')
        : this.$t('aice.aiproxy.provider')
    },
  },
  methods: {
    deploymentProviderLabelFormat,
    providerLabelFormat (providerItem) {
      if (this.isDeploymentKind(this.item)) {
        return deploymentProviderLabelFormat(providerItem)
      }
      return providerItem?.name || providerItem?.id || ''
    },
    providerOptionKey (providerItem) {
      return String(providerItem?.provider_key || '').trim()
    },
    providerOptionLabel (providerItem) {
      return this.providerLabelFormat(providerItem)
    },
    isDeploymentKind (item) {
      return item.provider_kind === PROVIDER_KIND_DEPLOYMENT
    },
    providerParams (item) {
      return getProviderSelectParams(this, item.provider_kind || PROVIDER_KIND_DEFAULT)
    },
    providerPlaceholder (item) {
      if (this.isDeploymentKind(item)) {
        return this.$t('aice.aiproxy.routing_binding_deployment_placeholder')
      }
      return this.$t('aice.aiproxy.routing_binding_public_provider_placeholder')
    },
    modelPlaceholder (item) {
      if (!item.ai_provider_id) {
        return this.$t('aice.aiproxy.routing_binding_model_placeholder_select_provider')
      }
      return this.$t('aice.aiproxy.routing_binding_model_placeholder')
    },
    providerExtraOpts (item) {
      if (!item.ai_provider_id || !item._provider_extra) return []
      return [item._provider_extra]
    },
    modelExtraOpts (item) {
      if (!item.ai_model_id || !item._model_extra) return []
      return [item._model_extra]
    },
    modelParams (item) {
      if (!item.ai_provider_id) return {}
      return getAiproxySelectParams(this, 'ai_models', {
        ai_provider_id: item.ai_provider_id,
      })
    },
    modelSelectProps (item) {
      return {
        placeholder: this.modelPlaceholder(item),
        disabled: !item.ai_provider_id,
      }
    },
    modelLabelFormat (item) {
      if (!item) return ''
      return item.model_key || item.name || item.id || ''
    },
    onModelItemSelected (item, modelItem) {
      if (!modelItem?.id) return
      item._model_extra = {
        id: modelItem.id,
        name: this.modelLabelFormat(modelItem),
        model_key: modelItem.model_key || '',
      }
      if (modelItem.model_key) {
        this.$emit('model-key-suggest', modelItem.model_key)
      }
    },
    onModelChange (item) {
      if (!item.ai_model_id) {
        item._model_extra = null
      }
    },
    onProviderKindChange (item) {
      item.ai_provider_id = ''
      item.ai_model_id = ''
      item._provider_extra = null
      item._model_extra = null
    },
    onProviderChange (item) {
      item.ai_model_id = ''
      item._model_extra = null
    },
  },
}
</script>

<style lang="less" scoped>
.routing-binding-labels {
  font-size: 12px;
}
</style>
