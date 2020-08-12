<template>
  <div>
    <a-form-item>
      <a-radio-group v-decorator="decorator.networkType" @change="change">
        <template  v-for="(item, key) in networkMaps">
          <a-radio-button v-if="(isServertemplate && (key !== 'schedtag')) || !isServertemplate" :value="key" :key="key">
            {{ item.label }}
            <help-tooltip v-if="key === 'default'" :name="`${key}ServerNetwork`" class="ml-2" />
          </a-radio-button>
        </template>
      </a-radio-group>
    </a-form-item>
    <a-form-item v-if="networkComponent === 'config'">
      <network-config
        :form="form"
        :decorator="decorator.networkConfig"
        :isBonding="isBonding"
        :network-params="networkListParams"
        :vpc-params="networkVpcParams"
        :vpc-resource="vpcResource"
        :ipsDisabled="ipsDisabled"
        :network-resource-mapper="networkResourceMapper"
        :vpc-resource-mapper="vpcResourceMapper"
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
import NetworkConfig from './NetworkConfig'
import NetworkSchedtag from './NetworkSchedtag'
import { NETWORK_OPTIONS_MAP } from '@Compute/constants'
import { HYPERVISORS_MAP } from '@/constants'

export default {
  name: 'ServerNetwork',
  components: {
    NetworkSchedtag,
    NetworkConfig,
  },
  props: {
    decorator: {
      type: Object,
      required: true,
      validator: val => val.networkType && val.networkConfig && val.networkSchedtag,
      // val.segment && val.ip && val.schedtag && val.strategy,
    },
    form: {
      type: Object,
      required: true,
      validator: val => val.fc,
    },
    networkListParams: {
      type: Object,
      default: () => ({}),
    },
    networkVpcParams: {
      type: Object,
      default: () => ({}),
    },
    vpcResource: {
      type: String,
    },
    schedtagParams: {
      type: Object,
      default: () => ({}),
    },
    isBonding: {
      type: Boolean,
      default: false,
    },
    networkResourceMapper: {
      type: Function,
      default: data => data,
    },
    vpcResourceMapper: {
      type: Function,
      default: data => data,
    },
    hypervisor: {
      type: String,
    },
    serverCount: {
      type: Number,
      default: 1,
    },
    isServertemplate: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    const { auto_alloc_network_count } = this.$store.getters.capability
    const _networkMaps = { ...NETWORK_OPTIONS_MAP }
    if (!auto_alloc_network_count || auto_alloc_network_count <= 0) {
      delete _networkMaps.default
    }
    return {
      networkComponent: '', // 指定IP子网 / 指定调度标签 的控件
      networkMaps: _networkMaps,
    }
  },
  computed: {
    ipsDisabled () {
      return this.serverCount > 1
    },
  },
  watch: {
    'form.fi.capability.auto_alloc_network_count' (val) {
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
    hypervisor (val, oldVal) {
      if (val === HYPERVISORS_MAP.esxi.key || oldVal === HYPERVISORS_MAP.esxi.key) {
        this.refreshNetworkConfig()
      }
    },
    serverCount (val, oldVal) {
      if (val !== oldVal && (val === 1 || oldVal === 1)) {
        this.refreshNetworkConfig()
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
    refreshNetworkConfig () {
      if (this.networkComponent === 'config') {
        this.networkComponent = ''
        this.$nextTick(() => { // 刷新 network-config 组件
          this.networkComponent = 'config'
        })
      }
    },
  },
}
</script>
