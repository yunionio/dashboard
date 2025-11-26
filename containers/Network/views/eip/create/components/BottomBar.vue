<template>
  <page-footer>
    <template v-slot:right>
      <div class="d-flex align-items-center" v-if="hasMeterService()">
        <div class="mr-4 d-flex align-items-center">
          <div class="text-truncate">{{$t('common_419')}}</div>
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
      <div class="btns-wrapper d-flex align-items-center">
        <a-button
          class="ml-3"
          type="primary"
          native-type="submit"
          html-type="submit"
          @click="handleConfirm"
          :loading="loading">{{ $t('common_258') }}</a-button>
        <a-button class="ml-3" @click="() => $router.back()">{{$t('common.cancel')}}</a-button>
      </div>
    </template>
  </page-footer>
</template>

<script>
import _ from 'lodash'
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { findPlatform } from '@/utils/common/hypervisor'
import DiscountPrice from '@/sections/DiscountPrice'
import { hasMeterService } from '@/utils/auth'
import { PriceFetcherByPriceKey } from '@/utils/common/price'
import { currencyUnitMap } from '@/constants/currency'

export default {
  name: 'BottomBar',
  components: {
    DiscountPrice,
  },
  inject: ['form', 'cloudEnv'],
  props: {
    currentCloudregion: {
      type: Object,
    },
    size: {
      type: Number,
    },
    bgpType: {
      required: true,
    },
    isHCSO: {
      required: false,
      default: false,
    },
    isHCS: {
      required: false,
      default: false,
    },
    cloudAccountId: String,
  },
  data () {
    this._getPrice = _.debounce(this._getPrice, 500)
    return {
      loading: false,
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
    ...mapGetters(['userInfo']),
  },
  watch: {
    currentCloudregion (value) {
      if (value.provider) {
        this._getPrice()
        return
      }
      if (value.external_id) {
        this._getPrice()
      }
    },
    size () {
      this._getPrice()
    },
    bgpType () {
      this._getPrice()
    },
    cloudAccountId () {
      this._getPrice()
    },
  },
  created () {
    this._getPrice()
  },
  methods: {
    resetPrice () {
      this.priceObj = null
      this.currency = currencyUnitMap.CNY.sign
      this.discount = 0
      this.price = null
      this.priceFormat = null
      this.originPrice = null
      this.priceTips = '--'
    },
    async _getPrice () {
      try {
        if (R.isEmpty(this.currentCloudregion) || !hasMeterService()) return
        if (!this.size) {
          this.resetPrice()
          return
        }
        let region = ''
        let externalProvider = ''
        if (this.currentCloudregion.external_id) {
          const arr = this.currentCloudregion.external_id.split('/')
          region = arr[1]
          externalProvider = arr[0]
        }
        const provider = externalProvider || this.currentCloudregion.provider
        const env = findPlatform(provider)
        if (env === 'private') return // 私有云暂时不支持EIP价格查询

        let bgpType = this.bgpType || ''
        if (provider.toLowerCase() === 'huawei') {
          if (['cn-southwest-2', 'cn-north-1', 'cn-east-2', 'cn-south-1'].indexOf(region) >= 0) {
            bgpType = '19_sbgp'
          } else if (region === 'cn-northeast-1') {
            bgpType = '19_telcom'
          } else {
            bgpType = '19_bgp'
          }
        } else if (provider.toLowerCase() === 'aliyun') {
          bgpType = 'bgp'
        }

        let price_key = `${provider}::${region}::::bandwidth::${bgpType}`
        if (provider.toLowerCase() === 'onecloud') {
          price_key = `${provider}::${region}::::eip::bandwidth${this.bgpType ? '.' + this.bgpType : ''}`
        }
        const pf = new PriceFetcherByPriceKey({
          scope: this.$store.getters.scope,
          priceKey: price_key,
          amount: this.size,
          cloudaccountId: this.cloudAccountId,
        })

        const p = await pf.getPriceObj()
        this.currency = p.currency
        this.discount = p.discount
        this.price = p.price
        this.priceFormat = p.priceFormat
        this.originPrice = p.originPrice
        this.priceTips = p.priceTips
      } catch (err) {
        throw err
      }
    },
    doCreate (data) {
      return new this.$Manager('eips').create({ data })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        values.domain = values.domain?.key
        values.tenant = values.project.key
        Reflect.deleteProperty(values, 'project')
        if (this.cloudEnv === 'private' && !this.isHCSO && !this.isHCS) {
          delete values.charge_type
          values.bandwidth = 0
          if (values.ip_addr) {
            values.ip = values.ip_addr
            delete values.ip_addr
          }
        }
        await this.doCreate(values)
        this.loading = false
        this.$message.success(this.$t('k8s.text_184'))
        this.$router.push('/eip')
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
