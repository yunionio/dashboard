<template>
  <div class="port-mapping">
    <a-form-item class="mb-0" :extra="(!showNetwork && form.fc.getFieldValue(decorators.serviceType[0]) === 'external') ? '导入的集群无法选择网络' : ''">
      <a-radio-group v-decorator="decorators.serviceType">
        <a-radio-button value="none">无</a-radio-button>
        <a-radio-button value="internal">内部</a-radio-button>
        <a-radio-button value="external">外部</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <lb-network
      v-if="showNetwork && form.fc.getFieldValue(decorators.serviceType[0]) === 'external'"
      :decorator="decorators.loadBalancerNetwork" />
    <div class="mt-3" v-if="form.fc.getFieldValue(decorators.serviceType[0]) !== 'none'">
      <div class="d-flex" v-for="(item, i) in portList" :key="item.key">
        <port :decorators="getDecorators(item)" :protocolDisabled="getProtocolDisabled(i)" @protocolChange="protocolChange" />
        <a-button v-if="portList.length > 1" type="danger" shape="circle" icon="delete" @click="del(item)" class="mt-1 ml-2" />
      </div>
      <a-button type="primary" icon="plus" @click="add">添加端口</a-button>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import Port from './Port'
import LbNetwork from './LbNetwork'
import { uuid } from '@/utils/utils'

export default {
  name: 'PortMapping',
  components: {
    Port,
    LbNetwork,
  },
  props: {
    decorators: {
      type: Object,
      validator: val => R.is(Array, val.serviceType) && R.is(Object, val.ports) && R.is(Array, val.loadBalancerNetwork),
    },
    form: {
      type: Object,
      required: true,
      validator: val => val.fc,
    },
    showNetwork: {
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
