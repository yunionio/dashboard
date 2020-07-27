<template>
  <div class="d-flex">
    <a-form-item>
      <a-input :addonBefore="$t('k8s.text_88')" v-decorator="decorators.port" type="number" style="width: 200px;" />
    </a-form-item>
    <a-form-item>
      <a-input :addonBefore="$t('k8s.text_89')" v-decorator="decorators.targetPort" type="number" style="width: 200px;" />
    </a-form-item>
    <a-form-item>
      <a-input-group compact>
        <div class="d-flex">
          <a-input class="oc-addonBefore ant-input-group-addon" style="width: 60px;" :defaultValue="$t('k8s.text_90')" readonly />
          <a-select style="width: 100px;" v-decorator="decorators.protocol" :disabled="protocolDisabled" @change="protocolChange">
            <a-select-option value="TCP">TCP</a-select-option>
            <a-select-option value="UDP">UDP</a-select-option>
          </a-select>
        </div>
      </a-input-group>
    </a-form-item>
  </div>
</template>

<script>
export default {
  name: 'K8SPortMappingPort',
  props: {
    decorators: {
      type: Object,
      required: true,
      validator: val => val.port && val.targetPort && val.protocol,
    },
    protocolDisabled: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    protocolChange (val) {
      this.$emit('protocolChange', val)
    },
  },
}
</script>
