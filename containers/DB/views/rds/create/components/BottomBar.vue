<template>
  <page-footer isForm>
     <template class="content" v-slot:left>
      <div
        v-for="(tip, idx) of tips"
        :key="idx"
        class="d-flex flex-column justify-content-center flex-grow-1">
        <div
          v-for="obj of tip"
          :key="obj.label"
          class="d-flex align-items-center">
          <span class="label" :class="obj.labelClass">{{ obj.label }}：</span>
          <template v-if="obj.value">
            <span class="value text-truncate" :class="obj.valueClass">{{ obj.value }}</span>
          </template>
          <template v-else>
            <span class="value placeholder text-truncate" :class="obj.valueClass">-</span>
          </template>
        </div>
      </div>
    </template>
    <template v-slot:right>
      <price-fetcher :values="values" :customPriceKey="customPriceKey" :extraPriceItems="extraPriceItems" :cloudAccountId="cloudAccountId" />
      <div class="btns-wrapper d-flex align-items-center">
        <a-button @click="doCreate" :loading="loading" type="primary" class="ml-3">{{$t('db.text_41')}}</a-button>
      </div>
    </template>
  </page-footer>
</template>
<script>
import { sizestr } from '@/utils/utils'
import { Manager } from '@/utils/manager'
import PriceFetcher from '@/components/PriceFetcher'

export default {
  name: 'BottomBar',
  components: {
    PriceFetcher,
  },
  inject: ['form'],
  props: {
    values: {
      type: Object,
    },
    cloudAccountId: String,
  },
  data () {
    return {
      loading: false,
    }
  },
  computed: {
    tips () {
      const { sku = {} } = this.values
      const ret = [
        [
          { label: this.$t('db.text_60'), labelClass: 'label-w-50', value: this.values.generate_name, valueClass: 'name-value' },
          { label: this.$t('db.text_40'), labelClass: 'label-w-50', value: sku.region },
        ],
        [
          { label: this.$t('db.text_109'), labelClass: 'label-w-80', value: this.$t('db.text_110', [sizestr(sku.vmem_size_mb, 'M', 1024)]) },
          { label: this.$t('db.text_111'), labelClass: 'label-w-50', value: sku.name },
        ],
        [
          { label: this.$t('db.text_112'), labelClass: 'label-w-80', value: `${this.values.engine || '-'}${this.values.engine_version || ''}` },
        ],
      ]
      return ret
    },
  },
  methods: {
    customPriceKey () {
      const { sku } = this.values
      if (!sku) return

      if (sku.rate && sku.rate.price_key) {
        return sku.rate.price_key
      }

      const { region_ext_id, provider, name, category, engine } = sku
      let pvt = provider.toLowerCase()
      if (sku.cloud_env) pvt = sku.cloud_env.toLowerCase() // 阿里金融云
      if (pvt === 'google') {
        return `${pvt}::${region_ext_id}::::rds::${category}_${engine}_${name}`
      } else if (pvt === 'qcloud') {
        return `${pvt}::${region_ext_id}::::rds::${category}_${name}`
      } else {
        return `${pvt}::${region_ext_id}::::rds::${name}`
      }
    },
    extraPriceItems () {
      const { sku, disk_size_gb } = this.values
      if (!sku || !disk_size_gb) return

      const { storage_type, provider, category, engine } = sku
      const pvt = provider.toLowerCase()
      const items = []
      if (pvt === 'huawei' || pvt.includes('aliyun') || pvt === 'google' || pvt === 'qcloud') {
        items.push({ resource_type: 'rds_storage', resource_key: `${category}_${engine}_${storage_type}`, amount: disk_size_gb })
      } else {
        items.push({ resource_type: 'rds_storage', resource_key: storage_type, amount: disk_size_gb })
      }
      return items
    },
    validateForm () {
      let f = false
      this.form.fc.validateFieldsAndScroll({ scroll: { alignWithTop: true, offsetTop: 100 } }, (err, values) => {
        const { sku } = values
        if (err !== null) {
          console.log(err)
        }
        f = (err === null) && (sku && sku.name)
      })
      return f
    },
    formatParams () {
      const params = {
        ...this.values,
      }
      if (params.zones) {
        const { zones } = params
        const zoneArr = zones.split('+')
        if (zoneArr && zoneArr.length > 0) {
          for (let i = 0; i < zoneArr.length; i++) {
            params[`zone${i + 1}`] = zoneArr[i]
          }
        }
        delete params.zones
      }
      if (params.sku) {
        const { sku } = params
        params.instance_type = sku.name
        delete params.sku
      }
      params.secgroup_ids = params.secgroup
      delete params.secgroup
      // 到期释放
      if (params.durationStandard !== 'none') {
        params.duration = params.duration || params.durationStandard
      }
      delete params.durationStandard
      return params
    },
    async doCreate () {
      if (!this.validateForm()) return false
      this.loading = true
      const manager = new Manager('dbinstances', 'v2')
      try {
        await manager.create({ data: this.formatParams() })
        this.$router.push('/rds')
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import '../../../../../../src/styles/less/theme';

.create-server-result-wrap {
  position: relative;
  .content {
    width: 80%;
    .label {
      color: #999;
      &.label-w-50 {
        width: 50px;
      }
      &.label-w-80 {
        width: 80px;
      }
    }
    .value {
      max-width: 300px;
      &.name-value {
        width: 100px;
      }
      &.placeholder {
        color: #888;
        font-style: italic;
      }
    }
    .prices {
      .hour {
        color: @error-color;
        font-size: 24px;
      }
      .tips {
        color: #999;
        font-size: 12px;
      }
    }
  }
  .btns-wrapper {
    position: absolute;
    right: 20px;
  }
  .errors-wrap {
    position: absolute;
    right: 0;
    bottom: 100px;
    width: 300px;
    padding: 15px;
    opacity: 1;
    transform: translateX(0);
    background-color: #fef0f0;
    box-shadow: -5px -5px 5px rgba(0, 0, 0, 0.1);
    border-top-left-radius: 3px;
    .title {
      color: @error-color;
      > i {
        font-size: 28px;
      }
      > span {
        font-size: 13px;
        font-weight: bold;
      }
    }
    .divider {
      margin: 15px 0;
      background-color: #dcdfe6;
      height: 1px;
    }
    .list {
      padding: 0 15px;
      color: @error-color;
      li {
        line-height: 1.8;
        list-style-type: disc;
      }
      &.sec-list {
        li {
          list-style-type: circle;
        }
      }
    }
  }
  .errors-slide-fade-enter-active {
    transition: all 0.3s ease;
  }
  .errors-slide-fade-leave-active {
    transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
  }
  .errors-slide-fade-enter,
  .errors-slide-fade-leave-to {
    transform: translateX(300px);
    opacity: 0;
  }
}
.prices {
    .hour {
      color: @error-color;
      font-size: 24px;
    }
    .tips {
      color: #999;
      font-size: 12px;
    }
  }
</style>
