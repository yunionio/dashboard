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
        :placeholder="$t('validator.resourceName')" />
      <template v-slot:extra>
        <name-repeated res="llm_deployments" :name="deployForm.name" />
      </template>
    </a-form-model-item>
    <a-form-model-item :label="$t('aice.llm_image')" prop="llm_image_id">
      <llm-image-select
        v-model="deployForm.llm_image_id"
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
    <a-form-model-item :label="$t('aice.llm_deployment.create.devices')" prop="deviceRows">
      <llm-gpu-devices-editor
        v-model="deployForm.deviceRows" />
      <div class="text-color-help">
        {{ $t('aice.llm_deployment.create.devices.help') }}
      </div>
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
import LlmImageSelect from '@Ai/sections/LlmImageSelect'
import LlmGpuDevicesEditor from '@Ai/sections/LlmGpuDevicesEditor'
import NameRepeated from '@/sections/NameRepeated'
import { getParamsForType } from '@Ai/views/llm-sku/constants/llmTypeConfig'
import { isValidDeviceRows } from '@Ai/utils/deviceFormUtils'

export default {
  name: 'CatalogDeployForm',
  components: {
    LlmImageSelect,
    LlmGpuDevicesEditor,
    NameRepeated,
  },
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
        name: [
          { required: true, message: this.$t('common.tips.input', [this.$t('common.name')]) },
          { validator: this.$validate('resourceName') },
        ],
        llm_image_id: [{ required: true, message: this.$t('common.tips.select', [this.$t('aice.llm_image')]) }],
        network: [{ required: true, message: this.$t('common.tips.select', [this.$t('compute.text_104')]) }],
        deviceRows: [{
          required: true,
          type: 'array',
          validator: (rule, value, callback) => {
            if (!isValidDeviceRows(value, { allowEmpty: false })) {
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
        details: true,
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
