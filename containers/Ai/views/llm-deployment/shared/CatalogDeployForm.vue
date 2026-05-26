<!--
  模型目录 / HuggingFace 部署共用表单（名称、镜像、网络、GPU、资源等）
-->
<template>
  <a-form-model
    ref="formRef"
    :model="deployForm"
    :rules="deployRules"
    :label-col="{ span: 6 }"
    :wrapper-col="{ span: 18 }">
    <a-form-model-item :label="$t('common.name')" prop="name">
      <a-input
        v-model="deployForm.name"
        :placeholder="$t('common.tips.input', [$t('common.name')])" />
    </a-form-model-item>
    <a-form-model-item :label="$t('aice.llm_image')" prop="llm_image_id">
      <base-select
        v-model="deployForm.llm_image_id"
        resource="llm_images"
        :params="imageParams"
        :select-props="{ placeholder: $t('common.tips.select', [$t('aice.llm_image')]) }" />
    </a-form-model-item>
    <a-form-model-item :label="$t('compute.text_104')" prop="network">
      <base-select
        v-model="deployForm.network"
        resource="networks"
        :params="networkParams"
        :select-props="{ placeholder: $t('common.tips.select', [$t('compute.text_104')]) }" />
    </a-form-model-item>
    <a-form-model-item :label="$t('aice.llm_deployment.create.devices')" prop="devices">
      <a-select
        v-model="deployForm.devices"
        mode="multiple"
        :options="gpuOptions"
        :placeholder="$t('common.tips.select', [$t('aice.llm_deployment.create.devices')])" />
      <div class="text-color-help">
        {{ $t('aice.llm_deployment.create.devices.help') }}
      </div>
    </a-form-model-item>
    <a-form-model-item :label="$t('aice.llm_deployment.replicas')">
      <a-input-number v-model="deployForm.replicas" :min="1" :max="100" />
    </a-form-model-item>
    <a-form-model-item label="CPU">
      <a-input-number v-model="deployForm.cpu" :min="1" :max="128" />
    </a-form-model-item>
    <a-form-model-item :label="$t('compute.text_300')">
      <a-input-number v-model="deployForm.memory" :min="512" :step="512" /> MB
    </a-form-model-item>
    <a-form-model-item :label="$t('aice.llm_deployment.create.disk_size')">
      <a-input-number v-model="deployForm.disk_size" :min="1024" :step="1024" /> MB
    </a-form-model-item>
  </a-form-model>
</template>

<script>
import { getParamsForType } from '@Ai/views/llm-sku/constants/llmTypeConfig'

export default {
  name: 'CatalogDeployForm',
  props: {
    deployForm: {
      type: Object,
      required: true,
    },
    llmType: {
      type: String,
      default: 'vllm',
    },
  },
  computed: {
    deployRules () {
      return {
        name: [{ required: true, message: this.$t('common.tips.input', [this.$t('common.name')]) }],
        llm_image_id: [{ required: true, message: this.$t('common.tips.select', [this.$t('aice.llm_image')]) }],
        network: [{ required: true, message: this.$t('common.tips.select', [this.$t('compute.text_104')]) }],
        devices: [{
          required: true,
          type: 'array',
          validator: (rule, value, callback) => {
            if (!Array.isArray(value) || value.length < 1) {
              callback(new Error(this.$t('common.tips.select', [this.$t('aice.llm_deployment.create.devices')])))
              return
            }
            callback()
          },
        }],
      }
    },
    imageParams () {
      return {
        limit: 20,
        scope: this.$store.getters.scope,
        $t: 1,
        ...getParamsForType(this.llmType),
      }
    },
    networkParams () {
      return {
        scope: this.$store.getters.scope,
        limit: 20,
        usable: true,
        host_type: 'container',
      }
    },
    gpuOptions () {
      const types = this.$store.getters.capability?.pci_model_types || {}
      const list = Object.values(types).filter(item => item.hypervisor === 'pod')
      return list.map(item => ({ value: item.model, label: item.model }))
    },
  },
  methods: {
    validate () {
      return this.$refs.formRef.validate()
    },
    clearValidate () {
      if (this.$refs.formRef) {
        this.$refs.formRef.clearValidate()
      }
    },
  },
}
</script>
