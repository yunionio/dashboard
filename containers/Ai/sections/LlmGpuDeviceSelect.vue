<!--
  GPU 型号多选，与推理模板 / 模型目录导入 SKU 表单中的 device 字段一致。
-->
<template>
  <base-select
    :value="value"
    :options="specList"
    :select-props="mergedSelectProps"
    v-bind="$attrs"
    v-on="$listeners" />
</template>

<script>
export default {
  name: 'LlmGpuDeviceSelect',
  inheritAttrs: false,
  props: {
    value: {
      type: [Array, String],
      default: () => [],
    },
    selectProps: {
      type: Object,
      default: () => ({}),
    },
  },
  computed: {
    specList () {
      const list = Object.values(this.$store.getters.capability?.pci_model_types || {})
        .filter(item => item.hypervisor === 'pod')
      return list.map(item => ({ key: item.model, label: item.model }))
    },
    mergedSelectProps () {
      return {
        mode: 'multiple',
        placeholder: this.$t('common.tips.select', [this.$t('aice.devices')]),
        allowClear: true,
        ...this.selectProps,
      }
    },
  },
}
</script>
