<template>
  <div>
    <a-tabs v-model="activeTab" @change="tabChange">
      <a-tab-pane tab="表单" key="form" />
      <a-tab-pane tab="编辑YAML" key="yaml" />
    </a-tabs>
    <labels-complete
      v-if="activeTab === 'form'"
      ref="labelRef"
      :decorators="decorators.config"
      title="配置"
      keyLabel="变量"
      :localData="localData"
      :valueSearch="valueSearch"
      :keyAutoCompleteProps="keyAutoCompleteProps" />
    <a-form-item>
      <code-mirror v-if="activeTab === 'yaml'" v-decorator="decorators.yaml" :options="cmOptions" />
    </a-form-item>
  </div>
</template>

<script>
import LabelsComplete from '@K8S/sections/LabelsComplete'

export default {
  name: 'K8sChartFormYaml',
  components: {
    LabelsComplete,
  },
  props: {
    decorators: {
      type: Object,
      validator: val => val.config && val.yaml,
      required: true,
    },
    localData: {
      type: Object,
      default: () => ({}),
    },
    valueSearch: {
      type: Function,
    },
  },
  data () {
    return {
      activeTab: 'form',
      cmOptions: {
        tabSize: 2,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        mode: 'text/x-yaml',
        theme: 'material',
      },
      keyAutoCompleteProps: {
        placeholder: '例如：image或者image.pullSecrets',
      },
    }
  },
  mounted () {
    this.$refs.labelRef.add()
  },
  methods: {
    tabChange (val) {
      this.$emit('update:activeTab', val)
    },
  },
}
</script>
