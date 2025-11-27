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
    <div class="d-flex align-items-center">
      <a-button type="primary" shape="circle" icon="plus" size="small" @click="add" />
      <a-button type="link" @click="add">{{$t('network.text_670')}}</a-button>
    </div>
  </div>
</template>

<script>
import { uuid } from '@/utils/utils'
import { validate } from '@/utils/validate'

export default {
  name: 'ReservedIPAddress',
  props: {
    decorators: {
      type: Object,
      required: true,
    },
    form: {
      type: Object,
      required: true,
    },
  },
  data () {
    return {
      networkList: [],
    }
  },
  created () {
    this.add()
  },
  methods: {
    getFormInstance () {
      return this.form || this.$parent?.form?.fc || this.$parent?.$parent?.form?.fc
    },
    ipChange (e, i) {
      this.networkList[i].ip = e.target.value
    },
    ipToInt (ip) {
      const REG = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
      const result = REG.exec(ip)
      if (!result) return -1
      const ret = (parseInt(result[1]) << 24 |
        parseInt(result[2]) << 16 |
        parseInt(result[3]) << 8 |
        parseInt(result[4])) >>> 0
      return ret
    },
    intToIp (ipInt) {
      return [
        (ipInt >>> 24) & 0xFF,
        (ipInt >>> 16) & 0xFF,
        (ipInt >>> 8) & 0xFF,
        ipInt & 0xFF,
      ].join('.')
    },
    getNextIp (ip) {
      if (!ip) return ''
      const ipResult = validate(ip, 'IPv4')
      if (ipResult === false || ipResult.result === false) {
        return ''
      }
      const ipInt = this.ipToInt(ip)
      if (ipInt === -1) return ''
      const nextInt = ipInt + 1
      if (nextInt > 0xFFFFFFFF) return ''
      return this.intToIp(nextInt)
    },
    add () {
      const uid = uuid()
      let nextIp = ''
      if (this.networkList.length > 0) {
        const lastIndex = this.networkList.length - 1
        const lastItem = this.networkList[lastIndex]
        const form = this.getFormInstance()
        if (form) {
          const lastFieldName = `networkIps[${lastItem.key}]`
          const lastFieldValue = form.getFieldValue(lastFieldName)
          if (lastFieldValue) {
            nextIp = this.getNextIp(lastFieldValue)
          }
        }
      }
      this.networkList.push({
        key: uid,
        ip: nextIp,
      })
      this.$nextTick(() => {
        if (nextIp) {
          const form = this.getFormInstance()
          if (form) {
            const fieldName = `networkIps[${uid}]`
            form.setFieldsValue({
              [fieldName]: nextIp,
            })
          }
        }
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
