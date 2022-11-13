<template>
  <div class="port-mapping">
    <a-form-item class="mb-0" :extra="(isImportCluster && form.fc.getFieldValue(decorators.serviceType[0]) === 'external') ? $t('k8s.text_91') : ''">
      <a-radio-group v-decorator="decorators.serviceType">
        <a-radio-button v-if="!ignoreNone" value="none">{{$t('k8s.text_75')}}</a-radio-button>
        <a-radio-button value="internal">{{$t('k8s.text_92')}}</a-radio-button>
        <a-radio-button value="external">{{$t('k8s.text_93')}}</a-radio-button>
        <a-radio-button value="nodePort">{{$t('k8s.node_port')}}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <lb-network
      v-if="!isImportCluster && form.fc.getFieldValue(decorators.serviceType[0]) === 'external'"
      :decorator="decorators.loadBalancerNetwork" />
    <lb-cluster
      v-if="!isImportCluster && form.fc.getFieldValue(decorators.serviceType[0]) === 'external' && isAdminMode"
      :decorator="decorators.loadBalancerCluster" />
    <div class="mt-3" v-if="form.fc.getFieldValue(decorators.serviceType[0]) !== 'none'">
      <div class="d-flex" v-for="(item, i) in portList" :key="item.key">
        <port :decorators="getDecorators(item)" :protocolDisabled="getProtocolDisabled(i)" :serviceType="getServiceType()" @protocolChange="protocolChange" />
        <a-button v-if="portList.length > 1" type="danger" shape="circle" icon="delete" @click="del(item)" class="mt-1 ml-2" />
      </div>
      <a-button type="primary" icon="plus" @click="add">{{$t('k8s.text_94')}}</a-button>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import Port from './Port'
import LbNetwork from './LbNetwork'
import LbCluster from './LbCluster'
import { uuid } from '@/utils/utils'

export default {
  name: 'K8SPortMapping',
  components: {
    Port,
    LbNetwork,
    LbCluster,
  },
  props: {
    decorators: {
      type: Object,
      validator: val => R.is(Array, val.serviceType) && R.is(Object, val.ports) && R.is(Array, val.loadBalancerNetwork) && R.is(Array, val.loadBalancerCluster),
    },
    form: {
      type: Object,
      required: true,
      validator: val => val.fc,
    },
    isImportCluster: {
      type: Boolean,
      default: false,
    },
    ignoreNone: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      portList: [
        { key: uuid() },
      ],
      currentProtocol: 'TCP',
    }
  },
  computed: {
    ...mapGetters(['isAdminMode']),
  },
  methods: {
    add () {
      const key = uuid()
      this.portList.push({ key })
      this.$nextTick(() => {
        this.form.fc.setFieldsValue({
          [`protocols[${key}]`]: this.currentProtocol,
        })
      })
    },
    del (item) {
      const index = this.portList.findIndex(val => val.key === item.key)
      this.portList.splice(index, 1)
    },
    getDecorators (val) {
      const ret = {}
      R.forEachObjIndexed((item, key) => {
        ret[key] = item(val.key)
      }, this.decorators.ports)
      return ret
    },
    getProtocolDisabled (i) {
      if (i > 0 && this.form.fc.getFieldValue(this.decorators.serviceType[0]) === 'external') {
        return true
      }
      return false
    },
    getServiceType () {
      return this.form.fc.getFieldValue(this.decorators.serviceType[0])
    },
    protocolChange (val) {
      this.currentProtocol = val
      const value = {}
      this.portList.forEach(v => {
        value[`protocols[${v.key}]`] = val
      })
      this.form.fc.setFieldsValue(value)
    },
  },
}
</script>
