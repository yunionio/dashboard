<template>
  <page-footer>
    <template v-slot:right>
      <div class="d-flex align-items-center">
        <div class="mr-4 d-flex align-items-center">
          <div class="text-truncate">{{$t('compute.text_286')}}</div>
          <div class="ml-2 prices">
            <div class="hour d-flex">
              <template v-if="price">
                <m-animated-number :value="price" :formatValue="formatToPrice" />
                <discount-price class="ml-2 mini-text" :discount="priceTotal.discount" :origin="priceTotal.hour_gross_price" />
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
import { PROVIDER_MAP } from '@/constants'
import { numerify } from '@/filters'
import DiscountPrice from '@/sections/DiscountPrice'

export default {
  name: 'BottomBar',
  components: {
    DiscountPrice,
  },
  inject: ['form'],
  props: {
    currentCloudregion: {
      type: Object,
    },
    currentStorage: {
      type: Object,
    },
    storageTypes: {
      type: Array,
    },
    size: {
      type: Number,
    },
    currentCloudzone: {
      type: Object,
    },
    provider: {
      type: [Array, String],
    },
  },
  data () {
    return {
      loading: false,
      priceTotal: null,
      key: '',
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
    currentStorage: {
      deep: true,
      handler (options) {
        this._getPrice()
      },
    },
    currentCloudregion (value) {
      if (value && value.provider) {
        this._getPrice()
        return
      }
      if (value && value.external_id) {
        this._getPrice()
      }
    },
    'currentCloudzone.external_id' () {
      this._getPrice()
    },
    key () {
      this._getPrice()
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
      let ret = `${this.currency} ${numerify(val, '0,0.000')}`
      ret += this.$t('compute.text_296')
      return ret
    },
    async _getPrice () {
      try {
        if (!this.currentStorage.value || !this.currentCloudregion) {
          this.key = ''
          return
        }
        // let _storageTypes = this.storageTypes.map(item => {
        //   return item.split('/')
        // })
        // _storageTypes = Object.fromEntries(_storageTypes)
        let key = ''
        let region = ''
        let zone = ''
        const { type, backend } = this.getType(this.currentStorage.value)
        let external_id = this.currentCloudregion.external_id
        if (!external_id) {
          external_id = '/'
        }
        let pv = this.currentCloudregion.provider.toLowerCase()
        if (this.currentCloudregion.external_id && this.currentCloudregion.external_id.includes('/')) {
          const cloudregionExternalArr = external_id.split('/')
          if (this.currentCloudregion.cloud_env === 'public') {
            if (!this.currentCloudzone) return
            key = type
            region = cloudregionExternalArr[1]
            zone = this.currentCloudzone.external_id.split('/')[2]
          } else {
            key = `${backend}.${type}`
          }
          pv = cloudregionExternalArr[0].toLowerCase()
        }
        this.key = key
        const price_keys = `${pv}::${region}::${zone}::disk::${key}::${this.size}GB`
        const { data } = await new this.$Manager('price_infos', 'v1').get({
          id: 'total',
          params: {
            price_keys,
            scope: this.$store.getters.scope,
          },
        })
        this.priceTotal = data
      } catch (err) {
        throw err
      }
    },
    doCreate (data) {
      return new this.$Manager('disks').create({ data })
    },
    async handleConfirm () {
      this.loading = true
      try {
        let values = await this.form.fc.validateFields()
        const { project, domain, cloudregion, zone, manager_id, backend, ...rest } = values
        const oProvider = PROVIDER_MAP[this.currentCloudregion.provider]
        const provider = Array.isArray(this.provider) ? this.provider[0] : this.provider
        values = {
          ...rest,
          backend: backend.split('__')[0],
          medium: backend.split('__')[1],
          hypervisor: oProvider ? oProvider.hypervisor : provider,
          size: values.size * 1024,
          project_domain: (domain && domain.key) || this.userInfo.projectDomainId,
          project_id: (project && project.key) || this.userInfo.projectId,
          prefer_region_id: cloudregion,
          prefer_zone: zone,
          prefer_manager_id: manager_id,
        }
        Reflect.deleteProperty(values, 'cloudregion')
        Reflect.deleteProperty(values, 'zone')
        await this.doCreate(values)
        this.$message.success(this.$t('k8s.text_184'))
        this.$router.push('/disk')
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    getType (curVal) {
      const curIndex = curVal.lastIndexOf('__')
      const type = curVal.substring(0, curIndex)
      const backend = curVal.substr(curIndex + 2)
      return { type, backend }
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
