<template>
  <div class="network-config">
    <div class="d-flex align-items-start mb-2" v-for="(item, i) in networkList" :key="item.key">
      <a-form-item class="w-100 mb-0 mr-2">
        <a-input
          :placeholder="$t('network.text_217')"
          v-decorator="decorators.networkConfig.ips(item.key, item.network)"
          @change="e => ipChange(e, i)" />
      </a-form-item>
      <a-button v-if="networkList.length > 1" shape="circle" icon="minus" size="small" @click="decrease(item.key, i)" class="mt-2 ml-1" />
    </div>
    <div class="d-flex align-items-center" v-if="networkCountRemaining > 0">
      <a-button type="primary" shape="circle" icon="plus" size="small" @click="add" />
      <a-button type="link" @click="add">{{$t('network.text_670')}}</a-button>
      <span class="network-count-tips">{{$t('network.text_169')}}<span class="remain-num">{{ networkCountRemaining }}</span>{{$t('network.text_170')}}</span>
    </div>
  </div>
</template>

<script>
import { uuid } from '@/utils/utils'

export default {
  name: 'ReservedIPAddress',
  props: {
    decorators: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      limit: 6,
      networkList: [],
    }
  },
  computed: {
    networkCountRemaining () {
      return this.limit - this.networkList.length
    },
  },
  created () {
    this.add()
  },
  methods: {
    ipChange (e, i) {
      this.networkList[i].ip = e.target.value
      // this.$emit('change', e.target.value)
    },
    add () {
      const uid = uuid()
      this.networkList.push({
        key: uid,
      })
    },
    decrease (uid, index) {
      this.networkList.splice(index, 1)
    },
  },
}
</script>

<style lang="less" scoped>
@import '../../../../../src/styles/less/theme';

.network-config {
  .network-count-tips {
    .remain-num {
      color: @primary-color;
    }
  }
}
</style>
