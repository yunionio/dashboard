<template>
  <div class="d-flex align-items-center" v-if="hasMeterService()">
    <div class="mr-4 d-flex align-items-center">
      <div class="text-truncate">{{$t('common_41901')}}</div>
      <div class="ml-2 prices">
        <div class="hour d-flex">
          <template v-if="price">
            <m-animated-number :value="price" :formatValue="priceFormat" />
            <discount-price class="ml-2 mini-text" :discount="discount" :origin="originPrice" />
          </template>
        </div>
        <div class="tips text-truncate">
          <span v-html="priceTips" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import _ from 'lodash'
import { PriceFetcherByPriceKey } from '@/utils/common/price'
import { hasMeterService } from '@/utils/auth'
import DiscountPrice from '@/sections/DiscountPrice'
import { currencyUnitMap } from '@/constants/currency'

export default {
  name: 'PriceFetcher',
  components: {
    DiscountPrice,
  },
  props: {
    values: {
      type: Object,
    },
    customPriceKey: {
      type: Function,
      default: undefined,
    },
    extraPriceItems: {
      type: Function,
      default: undefined,
    },
    cloudAccountId: String,
  },
  data () {
    this.getPrice = _.debounce(this._getPrice, 500)
    this.calcPrices = _.debounce(this.calcPrices, 200)
    return {
      priceObj: null,
      currency: currencyUnitMap.CNY.sign,
      discount: 0,
      price: null,
      priceFormat: null,
      originPrice: null,
      priceTips: '--',
      hasMeterService,
    }
  },
  computed: {
    rate () {
      const { sku = {} } = this.values
      if (sku && sku.rate) {
        return sku.rate
      }
      return null
    },
  },
  watch: {
    'rate.price_key': {
      handler (val) {
        this.getPrice()
      },
      immediate: true,
    },
    'values.duration': {
      handler (val) {
        this.getPrice()
      },
      immediate: true,
    },
    'values.billing_type': {
      handler (val) {
        this.getPrice()
      },
      immediate: true,
    },
    'values.disk_size_gb': {
      handler (val) {
        this.getPrice()
      },
      immediate: true,
    },
    cloudAccountId: {
      handler (val) {
        this.getPrice()
      },
      immediate: true,
    },
    'values.capacity': {
      handler (val, oldVal) {
        if (this.priceObj && val && val !== oldVal) {
          this.calcPrices()
        }
      },
    },
    'values.count': {
      handler (val, oldVal) {
        if (this.priceObj && val && val !== oldVal) {
          this.calcPrices()
        }
      },
    },
    'values.__count__': {
      handler (val, oldVal) {
        if (this.priceObj && val && val !== oldVal) {
          this.calcPrices()
        }
      },
    },
  },
  methods: {
    async _getPrice () {
      if (!hasMeterService()) return
      let price_key = this.rate ? this.rate.price_key : undefined
      // hook: 获取自定义的price key
      if (this.customPriceKey && typeof this.customPriceKey === 'function') {
        price_key = this.customPriceKey()
      }

      if (!price_key) return

      const pf = new PriceFetcherByPriceKey({
        scope: this.$store.getters.scope,
        priceKey: price_key,
        duration: this.values.duration || '',
        billType: this.values.billing_type,
        cloudaccountId: this.cloudAccountId,
      })

      // hook： 注入额外的计费项目
      // item: { resource_type: 'disk', resource_key: 'ssd', amount: 1 }
      if (this.extraPriceItems && typeof this.extraPriceItems === 'function') {
        const items = this.extraPriceItems() || []
        items.map((item) => {
          pf.priceFetcher.addItem(item)
        })
      }

      this.priceObj = await pf.getPriceObj()
      this.calcPrices()
    },
    calcPrices () {
      const p = this.priceObj
      if (!p) return
      const count = this.values.count || this.values.__count__ || this.values.capacity || 1
      p.setOptions({ count: count })
      this.currency = p.currency
      this.discount = p.discount
      this.price = p.price
      this.priceFormat = p.priceFormat
      this.originPrice = p.originPrice
      this.priceTips = p.priceTips
    },
  },
}
</script>

<style lang="less" scoped>
@import "~@/styles/less/theme";

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
