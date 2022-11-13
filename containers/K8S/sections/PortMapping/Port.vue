<template>
  <div class="d-flex">
    <a-form-item>
      <a-input v-decorator="decorators.port" type="number" style="width: 200px;">
        <template slot="addonBefore">
          <span>{{$t('k8s.service_port')}}</span>
          <a-tooltip :title="$t('k8s.service_port.desc')">
            <a-icon type="info-circle" />
          </a-tooltip>
        </template>
      </a-input>
    </a-form-item>
    <a-form-item>
      <a-input v-decorator="decorators.targetPort" type="number" style="width: 200px;">
        <template slot="addonBefore">
          <span>{{$t('k8s.target_port')}}</span>
          <a-tooltip :title="$t('k8s.target_port.desc')">
            <a-icon type="info-circle" />
          </a-tooltip>
        </template>
      </a-input>
    </a-form-item>
    <a-form-item v-if="isNodePort">
      <a-input-number :min="30000" :max="32767" v-decorator="decorators.nodePort" type="number" style="width: 200px;">
        <template slot="addonBefore">
          <span>{{$t('k8s.node_port')}}</span>
          <a-tooltip :title="$t('k8s.node_port.desc')">
            <a-icon type="info-circle" />
          </a-tooltip>
        </template>
      </a-input-number>
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
    serviceType: {
      type: String,
      required: true,
    },
  },
  computed: {
    isNodePort () {
      return this.serviceType === 'nodePort'
    },
  },
  methods: {
    protocolChange (val) {
      this.$emit('protocolChange', val)
    },
  },
}
</script>
