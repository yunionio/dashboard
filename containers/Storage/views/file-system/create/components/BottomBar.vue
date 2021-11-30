<template>
  <page-footer>
    <template v-slot:right>
      <div class="d-flex align-items-center" v-if="hasMeterService()">
        <div class="mr-4 d-flex align-items-center">
          <div class="text-truncate">{{$t('common_419')}}</div>
          <div class="ml-2 prices">
            <div class="hour d-flex">
              <template v-if="price">
                <m-animated-number :value="price" :formatValue="formatToPrice" />
                <discount-price class="ml-2 mini-text" :discount="priceTotal.discount" :origin="originPrice" />
              </template>
            </div>
            <div class="tips text-truncate">
              <span v-html="priceTips" />
            </div>
          </div>
        </div>
      </div>
      <div class="btns-wrapper d-flex align-items-center">
        <a-button
          class="ml-3"
          type="primary"
          native-type="submit"
          html-type="submit"
          @click="handleConfirm"
          :loading="loading">{{ $t('common_258') }}</a-button>
      </div>
    </template>
  </page-footer>
</template>

<script>
import { mapGetters } from 'vuex'
import { numerify } from '@/filters'
import DiscountPrice from '@/sections/DiscountPrice'
import { hasMeterService } from '@/utils/auth'

export default {
  name: 'BottomBar',
  components: {
    DiscountPrice,
  },
  inject: ['form'],
  props: {
    values: {
      type: Object,
    },
  },
  data () {
    return {
      loading: false,
      priceTotal: null,
      hasMeterService,
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    rate () {
      const { sku = {} } = this.values
      if (sku && sku.rate) {
        return sku.rate
      }
      return null
    },
    durationNum () {
      if (this.isPackage) {
        const { duration } = this.values
        let num = parseInt(duration)
        if (num && duration.endsWith('Y')) {
          num *= 12
        }
        return num
      }
      return 1
    },
    capacity () {
      if (this.values.capacity && this.values.capacity > 0) {
        return this.values.capacity
      }
      return 1
    },
    isPackage () {
      return this.values.billing_type === 'prepaid'
    },
    price () {
      if (this.rate && this.priceTotal) {
        const { month_price: month } = this.rate
        const { hour_price: hour } = this.priceTotal
        if (this.isPackage) {
          return parseFloat(month) * this.durationNum * this.capacity
        }
        return parseFloat(hour) * this.capacity
      }
      return null
    },
    originPrice () {
      if (this.priceTotal) {
        const { month_gross_price: month, hour_gross_price: hour } = this.priceTotal
        if (this.isPackage && this.durationNum) {
          return parseFloat(month) * this.durationNum
        }
        return parseFloat(hour)
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
        let _day = numerify(this.price * 24, '0,0.00')
        let _month = numerify(_day * 30, '0,0.00')
        if (this.isPackage) {
          _day = numerify(this.price / 30, '0,0.00')
          _month = numerify(this.price, '0,0.00')
        }
        return this.$t('compute.text_1138', [this.currency, _day, this.currency, _month])
      }
      return '--'
    },
  },
  watch: {
    'rate.price_key': {
      handler (val) {
        val && this._getPrice(val)
      },
      immediate: true,
    },
  },
  methods: {
    formatToPrice (val) {
      let unit = this.$t('network.unit.hour')
      const price = numerify(val, '0,0.00')
      if (this.isPackage) {
        unit = this.$t('network.unit.month')
      }
      return `${this.currency} ${price}/${unit}`
    },
    async _getPrice (price_key) {
      if (!hasMeterService()) return
      try {
        const { data } = await new this.$Manager('price_infos', 'v1').get({
          id: 'total',
          params: {
            price_keys: [price_key],
            scope: this.$store.getters.scope,
          },
        })
        this.priceTotal = data
      } catch (err) {
        throw err
      }
    },
    doCreate (data) {
      return new this.$Manager('file_systems').create({ data })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const params = {
          billing_type: values.billing_type,
          name: values.name,
          network_id: values.network,
          zone_id: values.zone_id,
          project_domain: values.project_domain,
        }
        if (values.tag) {
          params.__meta__ = values.tag
        }
        if (values.sku) {
          params.file_system_type = values.sku.file_system_type
          params.protocol = values.sku.protocol
          params.storage_type = values.sku.storage_type
        }
        if (values.capacity > 0) {
          params.capacity = values.capacity
        }
        if (values.billing_type === 'postpaid') {
          if (values.durationStandard !== 'none') {
            params.duration = values.durationStandard
            if (values.durationStandard === 'custom') {
              params.duration = values.duration
            }
          }
          if (values.auto_renew) {
            params.auto_renew = values.auto_renew
          }
        } else {
          params.duration = values.duration
        }

        await this.doCreate(params)
        this.loading = false
        this.$message.success(this.$t('network.nat.create.success'))
        this.$router.push('/nas')
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>

<style lang="less" scoped>
@import '../../../../../../src/styles/less/theme';

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
