<template>
  <page-footer>
    <template v-slot:right>
      <div class="d-flex align-items-center">
        <div class="mr-4 d-flex align-items-center">
          <div class="text-truncate">{{$t('common_419')}}</div>
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
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { numerify } from '@/filters'
import { findPlatform } from '@/utils/common/hypervisor'

export default {
  name: 'BottomBar',
  inject: ['form', 'cloudEnv'],
  props: {
    currentCloudregion: {
      type: Object,
    },
    size: {
      type: Number,
    },
  },
  data () {
    return {
      loading: false,
      priceTotal: null,
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    price () {
      if (this.priceTotal) {
        const { hour_price } = this.priceTotal
        return hour_price
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
        const _day = numerify(this.price * 24, '0,0.00')
        const _month = numerify(this.priceTotal.month_price, '0,0.00')
        return this.$t('compute.text_1138', [this.currency, _day, this.currency, _month])
      }
      return '--'
    },
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
  },
  created () {
    this._getPrice()
  },
  methods: {
    formatToPrice (val) {
      let ret = `${this.currency} ${numerify(val, '0,0.00')}`
      ret += this.$t('compute.text_296')
      return ret
    },
    async _getPrice () {
      try {
        if (R.isEmpty(this.currentCloudregion)) return
        if (!this.size) {
          this.priceTotal = null
          return
        }
        let region = ''
        if (this.currentCloudregion.external_id) {
          region = this.currentCloudregion.external_id.split('/')[1]
        }
        const provider = this.currentCloudregion.provider.toLowerCase()
        const env = findPlatform(provider)
        if (env === 'private') return // 私有云暂时不支持EIP价格查询
        const price_keys = `${provider}::${region}::::eip::::${this.size}Mb`
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
        if (this.cloudEnv === 'private') {
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
