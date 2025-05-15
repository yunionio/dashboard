<template>
  <page-footer>
    <template v-slot:right>
      <div class="d-flex align-items-center" v-if="hasMeterService()">
        <div class="mr-4 d-flex align-items-center">
          <div class="text-truncate">{{$t('compute.text_286')}}</div>
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
import { mapGetters } from 'vuex'
import { PROVIDER_MAP } from '@/constants'
import DiscountPrice from '@/sections/DiscountPrice'
import { hasMeterService } from '@/utils/auth'
import { PriceFetcherByPriceKey } from '@/utils/common/price'

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
    this._getPrice = _.debounce(this._getPrice, 500)
    return {
      loading: false,
      priceObj: null,
      currency: '¥',
      discount: 0,
      price: null,
      priceFormat: null,
      originPrice: null,
      priceTips: '--',
      key: '',
      hasMeterService,
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
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
    async _getPrice () {
      if (!hasMeterService()) return
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
        let pv = this.currentCloudregion.provider
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
          pv = cloudregionExternalArr[0]
        } else {
          key = `${backend}.${type}`
        }
        this.key = key
        const price_key = `${pv}::${region}::${zone}::disk::${key}`
        const pf = new PriceFetcherByPriceKey({
          scope: this.$store.getters.scope,
          priceKey: price_key,
          amount: this.size,
        })

        const p = await pf.getPriceObj()
        p.setOptions({ priceFmt: '0,0.000' })
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
      return new this.$Manager('disks').create({ data })
    },
    async handleConfirm () {
      this.loading = true
      try {
        let values = await this.form.fc.validateFields()
        const { project, domain, cloudregion, zone, manager_id, backend, encryptEnable, encrypt_key_id, encrypt_key_alg, storage, iops, throughput, ...rest } = values
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
        if (encryptEnable === 'existing' && encrypt_key_id) {
          values.encrypt_key_id = encrypt_key_id
        } else if (encryptEnable === 'new') {
          values.encrypt_key_new = true
          values.encrypt_key_alg = encrypt_key_alg
          values.encrypt_key_user_id = this.userInfo.id
        }
        if (storage) {
          values.storage_id = storage
        }
        if (iops) {
          values.iops = iops
        }
        if (throughput) {
          values.throughput = throughput
        }
        Reflect.deleteProperty(values, 'cloudregion')
        Reflect.deleteProperty(values, 'zone')
        await this.doCreate(values)
        const successBack = () => {
          this.$message.success(this.$t('k8s.text_184'))
          this.$router.push('/disk')
        }
        successBack()
      } catch (error) {
        this.loading = false
        throw error
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
