<template>
  <div>
    <div class="d-flex" v-for="(item, i) in ipSubnets" :key="item.key">
      <ip-subnet
        :decorator="genDecorator(item.key)" />
      <a-button shape="circle" icon="minus" size="small" v-if="!hiddenDeleteAction && ipSubnets.length > 1" @click="decrease(i)" class="mt-2 ml-2" />
    </div>
    <div class="d-flex align-items-center" v-if="!hiddenAddAction && remain > 0">
      <a-button type="primary" shape="circle" icon="plus" size="small" @click="add" />
      <a-button type="link" @click="add">{{$t('network.text_612')}}</a-button>
      <span class="count-tips">{{$t('network.text_169')}}<span class="remain-num">{{ remain }}</span>{{$t('network.text_170')}}</span>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import IpSubnet from '@/sections/IpSubnet'
import { uuid } from '@/utils/utils'

export default {
  name: 'IpSubnets',
  components: {
    IpSubnet,
  },
  props: {
    decorator: {
      type: Object,
      required: true,
      validator: val => {
        const fields = ['startip', 'endip', 'netmask', 'gateway', 'vlan']
        return fields.every(f => R.is(Function, val[f]))
      },
    },
    hiddenAddAction: {
      type: Boolean,
      default: false,
    },
    hiddenDeleteAction: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      ipSubnets: [{ key: uuid() }],
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
