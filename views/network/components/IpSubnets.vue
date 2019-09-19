<template>
  <div>
    <div class="d-flex" v-for="(item, i) in ipSubnets" :key="item.key">
      <ip-subnet
        :decorator="genDecorator(item.key)" />
      <a-button shape="circle" icon="minus" size="small" @click="decrease(i)" class="mt-2 ml-2" />
    </div>
    <div class="d-flex align-items-center" v-if="remain > 0">
      <a-button type="primary" shape="circle" icon="plus" size="small" @click="add" />
      <a-button type="link" @click="add">添加新IP子网</a-button>
      <span class="count-tips">您还可以添加 <span class="remain-num">{{ remain }}</span> 个</span>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import IpSubnet from '@Compute/sections/IpSubnet'
import { uuid } from '@/utils/utils'

export default {
  name: 'IpSubnets',
  components: {
    IpSubnet,
  },
  inject: ['form'],
  props: {
    decorator: {
      type: Object,
      required: true,
      validator: val => {
        const fields = ['startip', 'endip', 'netmask', 'gateway', 'vlan']
        return fields.every(f => R.is(Function, val[f]))
      },
    },
  },
  data () {
    return {
      ipSubnets: [],
    }
  },
  computed: {
    remain () {
      const remain = 6 - this.ipSubnets.length
      return Math.max(remain, 0)
    },
  },
  methods: {
    genDecorator (uid) {
      const ret = {}
      R.forEachObjIndexed((value, key) => {
        ret[key] = value(uid)
      }, this.decorator)
      return ret
    },
    add () {
      this.$emit('clear-error')
      const key = uuid()
      this.ipSubnets.push({
        key,
      })
    },
    decrease (index) {
      this.ipSubnets.splice(index, 1)
    },
  },
}
</script>
