<template>
  <div class="network-schedtag">
    <div class="network-schedtag__row" v-for="(item, i) in schedtagList" :key="item.key">
      <a-tag color="blue" class="network-schedtag__tag">{{ isBonding ? 'bond' : $t('compute.text_193')}}{{i}}</a-tag>
      <div class="network-schedtag__main">
        <schedtag-policy :form="form" :decorators="genDecorator(item.key)" :schedtag-params="{ ...schedtagParams, $t: `net-schedtag-${i}` }" :policyReactInSchedtag="false" />
        <template v-if="showDeviceConfig">
          <template v-if="item.deviceShow">
            <a-form-item class="mb-0 ml-1" :wrapperCol="{ span: 24 }">
              <oc-select
                v-decorator="decorator.devices(item.key)"
                :data="gpuOptions"
                :placeholder="$t('compute.sriov_device_tips')" />
            </a-form-item>
            <a-button type="link" class="network-schedtag__link" @click="triggerShowDevice(item)">{{$t('compute.text_135')}}</a-button>
          </template>
          <a-button v-else type="link" class="network-schedtag__link" @click="triggerShowDevice(item)">{{ $t('compute.config_sriov_net') }}</a-button>
        </template>
      </div>
      <a-button shape="circle" icon="minus" size="small" class="network-schedtag__del" @click="decrease(item.key, i)" />
    </div>
    <div class="d-flex align-items-center" v-if="schedtagCountRemaining > 0">
      <a-button type="primary" shape="circle" icon="plus" size="small" @click="add" />
      <a-button type="link" @click="add">{{$t('compute.text_183')}}</a-button>
      <span class="network-count-tips">{{$t('compute.text_130')}}<span class="remain-num">{{ schedtagCountRemaining }}</span>{{$t('compute.text_200')}}</span>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { uuid } from '@/utils/utils'
import { SCHEDTAG_POLICY_OPTIONS } from '@/constants'
import SchedtagPolicy from '@/sections/SchedtagPolicy'

export default {
  name: 'NetworkSchedtag',
  components: {
    SchedtagPolicy,
  },
  props: {
    schedtagParams: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    form: {
      type: Object,
      required: true,
    },
    decorator: {
      type: Object,
      required: true,
      validator: val => R.is(Function, val.schedtags) && R.is(Function, val.policys),
    },
    limit: {
      type: Number,
      default: 8, // 默认支持最多 8 个ip子网
    },
    isBonding: {
      type: Boolean,
      default: false,
    },
    showDeviceConfig: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      schedtagList: [],
      policyOpts: SCHEDTAG_POLICY_OPTIONS,
    }
  },
  computed: {
    schedtagCountRemaining () {
      return this.limit - this.schedtagList.length
    },
    gpuOptions () {
      const specs = this.form.fi.capability.specs || {}
      const data = specs.isolated_devices || {}
      const ret = [{ key: 'xx', label: 'xx' }]
      for (const key in data) {
        if (data.hasOwnProperty(key)) {
          const item = data[key]
          if (item.dev_type.startsWith('NIC')) {
            ret.push({
              ...item,
              key: `${item.model}`,
              label: `${item.model}`,
            })
          }
        }
      }
      return ret
    },
  },
  created () {
    this.add()
  },
  methods: {
    initData (data) {
      this.schedtagList = data.map(schedtag => {
        const item = schedtag.schedtags[0]
        const obj = {
          key: uuid(),
          deviceShow: false,
          schedtag: item.id,
          policy: item.strategy,
          device: item.sriov_device && item.sriov_device.model,
        }
        if (item.sriov_device && item.sriov_device.model) {
          obj.deviceShow = true
        }
        return obj
      })
      this.$nextTick(() => {
        for (const item of this.schedtagList) {
          this.form.fc.setFieldsValue({
            [this.decorator.schedtags(item.key)[0]]: item.schedtag,
            [this.decorator.policys(item.key)[0]]: item.policy,
          })
          if (item.device) {
            setTimeout(() => {
              this.form.fc.setFieldsValue({
                [this.decorator.devices(item.key)[0]]: item.device,
              })
            }, 2000)
          }
        }
      })
    },
    add () {
      const uid = uuid()
      this.schedtagList.push({
        key: uid,
        deviceShow: false,
      })
    },
    decrease (uid, index) {
      this.schedtagList.splice(index, 1)
    },
    genDecorator (key) {
      return {
        schedtag: this.decorator.schedtags(key),
        policy: this.decorator.policys(key),
      }
    },
    triggerShowDevice (item, i) {
      item.deviceShow = !item.deviceShow
    },
  },
}
</script>

<style lang="less" scoped>
@import '../../../../src/styles/less/theme';

.network-schedtag {
  .network-count-tips {
    .remain-num {
      color: @primary-color;
    }
  }

  &__row {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-bottom: 8px;
  }

  &__tag {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    height: 32px;
    margin: 0;
    line-height: 30px;
    font-size: 12px;
  }

  &__main {
    display: flex;
    flex: 0 1 auto;
    flex-wrap: wrap;
    align-items: flex-start;
    gap: 8px;
    min-width: 0;

    ::v-deep .ant-form-item {
      margin-bottom: 0;
    }

    ::v-deep .ant-form-item-control {
      line-height: 32px;
    }
  }

  &__link {
    height: 32px;
    padding: 0;
    line-height: 32px;
  }

  &__del {
    flex-shrink: 0;
    margin-top: 4px;
  }
}
</style>
