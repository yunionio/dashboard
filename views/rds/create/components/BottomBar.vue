<template>
  <page-footer>
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
       <div class="d-flex align-items-center">
          <div class="mr-4 d-flex align-items-center">
            <div class="text-truncate">{{$t('db.text_108')}}</div>
            <div class="ml-2 prices">
              <div class="hour text-truncate">
                <template v-if="price">
                  <m-animated-number :value="price" :formatValue="formatToPrice" />
                </template>
              </div>
              <div class="tips text-truncate">
                <span v-html="priceTips" />
              </div>
            </div>
          </div>
      </div>
      <div class="btns-wrapper d-flex align-items-center">
        <a-button @click="doCreate" :loading="loading" type="primary" class="ml-3">{{$t('db.text_41')}}</a-button>
      </div>
    </template>
  </page-footer>
</template>
<script>
import _ from 'lodash'
import { BILL_TYPES_MAP } from '@DB/views/redis/constants'
import { sizestr } from '@/utils/utils'
import { Manager } from '@/utils/manager'
import { numerify } from '@/filters'

export default {
  name: 'BottomBar',
  inject: ['form'],
  props: {
    values: {
      type: Object,
    },
  },
  data () {
    this.getPrice = _.debounce(this._getPrice, 500)
    return {
      loading: false,
      priceTotal: undefined,
    }
  },
  computed: {
    skuId () {
      if (this.values.sku) {
        return this.values.sku.id
      }
      return undefined
    },
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
    // 是否为包年包月
    isPackage () {
      return this.values.billing_type === BILL_TYPES_MAP.prepaid.key
    },
    durationNum () {
      if (this.isPackage) {
        const { duration } = this.values
        let num = parseInt(duration)
        if (num && duration.endsWith('Y')) {
          num *= 12 // 1年=12月
        } else if (num && duration.endsWith('W')) {
          num *= 0.25 // 1周=0.25月
        }
        return num
      }
      return 0
    },
    price () {
      const { __count__ = 1 } = this.values
      if (__count__ && this.priceTotal) {
        const { month_price, hour_price } = this.priceTotal
        let _price = hour_price
        if (this.isPackage && this.durationNum) {
          _price = parseFloat(month_price) * this.durationNum
        }
        return _price * parseFloat(__count__)
      }
      return null
    },
    currency () {
      const currencys = {
        USD: '$',
        CNY: '¥',
      }
      if (this.priceTotal) {
        return currencys[this.priceTotal.currency]
      }
      return '¥'
    },
    priceTips () {
      if (this.price) {
        if (this.isPackage && this.durationNum) {
          const _day = (this.price / 30 / this.durationNum).toFixed(2)
          const _hour = numerify((parseFloat(_day) / 24), '0,0.00')
          return this.$t('db.text_113', [this.currency, _day, this.currency, _hour])
        } else {
          const _day = numerify(this.price * 24, '0,0.00')
          const _month = numerify(this.priceTotal.month_price, '0,0.00')
          return this.$t('db.text_114', [this.currency, _day, this.currency, _month])
        }
      }
      return '--'
    },
  },
  watch: {
    skuId () {
      this.getPrice()
    },
    'values.disk_size_gb' () {
      this.getPrice()
    },
  },
  methods: {
    formatToPrice (val) {
      let ret = `${this.currency} ${numerify(val, '0,0.00')}`
      ret += !this.isPackage ? this.$t('db.text_115') : ''
      return ret
    },
    async _getPrice () {
      const { sku, disk_size_gb } = this.values
      if (!sku || !disk_size_gb) {
        this.priceTotal = undefined
        return false
      }
      try {
        const { region_ext_id, storage_type, provider, name, category, engine } = sku
        const pvt = provider.toLowerCase()
        const price_keys = []
        if (pvt === 'google') {
          price_keys.push(`${pvt}::${region_ext_id}::::rds::${category}_${engine}_${name}`)
        } else if (pvt === 'qcloud') {
          price_keys.push(`${pvt}::${region_ext_id}::::rds::${category}_${name}`)
        } else {
          price_keys.push(`${pvt}::${region_ext_id}::::rds::${name}`)
        }

        if (pvt === 'huawei' || pvt === 'aliyun') {
          price_keys.push(`${pvt}::${region_ext_id}::::rds_storage::${category}_${engine}_${storage_type}::${disk_size_gb}GB`)
        } else if (pvt === 'google') {
          price_keys.push(`${pvt}::${region_ext_id}::::rds_storage::${category}_${engine}_${storage_type}::${disk_size_gb}GB`)
        } else if (pvt === 'qcloud') {
          price_keys.push(`${pvt}::${region_ext_id}::::rds_storage::${category}_${engine}_${storage_type}::${disk_size_gb}GB`)
        } else {
          price_keys.push(`${pvt}::${region_ext_id}::::rds_storage::${storage_type}::${disk_size_gb}GB`)
        }
        const { data } = await new this.$Manager('price_infos', 'v1').get({
          id: 'total',
          params: {
            price_keys,
          },
        })
        this.priceTotal = data
      } catch (err) {
        throw err
      }
    },
    validateForm () {
      let f = false
      this.form.fc.validateFieldsAndScroll({ scroll: { alignWithTop: true, offsetTop: 100 } }, (err, values) => {
        const { sku } = values
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
      if (params.secgroup && params.secgroup.length > 0) {
        params.secgroup = params.secgroup[0]
      }
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
