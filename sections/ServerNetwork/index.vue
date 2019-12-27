<template>
  <div>
    <a-form-item>
      <a-radio-group v-decorator="decorator.networkType" @change="change">
        <a-radio-button v-for="(item, key) in networkMaps" :value="key" :key="key">{{ item.label }}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item v-if="networkComponent === 'config'">
      <network-config
        :form="form"
        :decorator="decorator.networkConfig"
        :isBonding="isBonding"
        :network-params="networkListParams"
        :limit="form.fi.capability.max_nic_count" />
    </a-form-item>
    <a-form-item v-if="networkComponent === 'schedtag'">
      <network-schedtag
        :form="form"
        :decorator="decorator.networkSchedtag"
        :isBonding="isBonding"
        :schedtag-params="schedtagParams"
        :limit="form.fi.capability.max_nic_count" />
    </a-form-item>
  </div>
</template>

<script>
import { NETWORK_OPTIONS_MAP } from '@Compute/constants'
import NetworkConfig from './NetworkConfig'
import NetworkSchedtag from './NetworkSchedtag'

export default {
  name: 'ServerNetwork',
  components: {
    NetworkSchedtag,
    NetworkConfig,
  },
  inject: ['form'],
  props: {
    decorator: {
      type: Object,
      required: true,
      validator: val => val.networkType && val.networkConfig && val.networkSchedtag,
      // val.segment && val.ip && val.schedtag && val.strategy,
    },
    networkListParams: {
      type: Object,
      default: () => ({}),
    },
    schedtagParams: {
      type: Object,
      default: () => ({}),
    },
    isBonding: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      networkMaps: { ...NETWORK_OPTIONS_MAP },
      networkComponent: '', // 指定IP子网 / 指定调度标签 的控件
    }
  },
  watch: {
    'form.fi.capability.public_network_count' (val) {
      if (val === 0) {
        delete this.networkMaps[NETWORK_OPTIONS_MAP.default.key]
        this.form.fc.setFieldsValue({
          networkType: NETWORK_OPTIONS_MAP.manual.key,
        })
        this.networkComponent = 'config'
      } else {
        this.networkMaps = { ...NETWORK_OPTIONS_MAP }
        this.form.fc.setFieldsValue({
          networkType: NETWORK_OPTIONS_MAP.default.key,
        })
        this.networkComponent = ''
      }
    },
  },
  methods: {
    change (e) {
      switch (e.target.value) {
        case NETWORK_OPTIONS_MAP.default.key:
          this.networkComponent = ''
          break
        case NETWORK_OPTIONS_MAP.manual.key:
          this.networkComponent = 'config'
          break
        case NETWORK_OPTIONS_MAP.schedtag.key:
          this.networkComponent = 'schedtag'
          break
      }
    },
  },
}
</script>
