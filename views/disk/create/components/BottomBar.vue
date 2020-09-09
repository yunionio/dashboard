<template>
  <page-footer>
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

export default {
  name: 'BottomBar',
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
        return this.$t('db.text_114', [this.currency, _day, this.currency, _month])
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
      if (value.provider) {
        this._getPrice()
        return
      }
      if (value.external_id) {
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
      let ret = `${this.currency} ${numerify(val, '0,0.00')}`
      ret += this.$t('db.text_115')
      return ret
    },
    async _getPrice () {
      try {
        if (!this.currentStorage.value) {
          this.key = ''
          return
        }
        let _storageTypes = this.storageTypes.map(item => {
          return item.split('/')
        })
        _storageTypes = Object.fromEntries(_storageTypes)
        let key = ''
        let region = ''
        let zone = ''
        if (this.currentCloudregion.cloud_env === 'public') {
          key = this.currentStorage.value
          region = this.currentCloudregion.external_id.split('/')[1]
          zone = this.currentCloudzone.external_id.split('/')[2]
        } else {
          key = `${_storageTypes[this.currentStorage.value]}.${this.currentStorage.value}`
        }
        this.key = key
        const price_keys = `${this.currentCloudregion.provider.toLowerCase()}::${region}::${zone}::disk::${key}::${this.size}GB`
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
      return new this.$Manager('disks').create({ data })
    },
    async handleConfirm () {
      this.loading = true
      try {
        let values = await this.form.fc.validateFields()
        const { project, domain, cloudregion, zone, ...rest } = values
        const oProvider = PROVIDER_MAP[this.currentCloudregion.provider]
        const provider = Array.isArray(this.provider) ? this.provider[0] : this.provider
        values = {
          ...rest,
          hypervisor: oProvider ? oProvider.hypervisor : provider,
          size: values.size * 1024,
          project_domain: (domain && domain.key) || this.userInfo.projectDomainId,
          project_id: (project && project.key) || this.userInfo.projectId,
          prefer_region: cloudregion,
          prefer_zone: zone,
        }
        Reflect.deleteProperty(values, 'cloudregion')
        Reflect.deleteProperty(values, 'zone')
        Reflect.deleteProperty(values, 'provider')
        await this.doCreate(values)
        this.$message.success(this.$t('k8s.text_184'))
        this.$router.push('/disk')
      } catch (error) {
        throw error
      } finally {
        this.loading = false
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
