import _ from 'lodash'
import i18n from '@/locales'
import { numerify } from '@/filters'
import { PROVIDER_MAP } from '@/constants'
import { Manager } from '@/utils/manager'
import { currencyUnitMap } from '@/constants/currency'

export class PriceFetcher {
  // eslint-disable-next-line
  constructor({ scope = '', provider = '', region = '', zone = '', cloudaccountId = '', price_unit = 'hour', period = 1 } = {}) {
    this.manager = new Manager('prices', 'v1')
    this.scope = scope
    this.provider = provider
    this.region = region
    this.zone = zone
    this.cloudaccountId = cloudaccountId
    this.price_unit = price_unit || 'hour'
    this.period = period || 1
    this.items = []
  }

  // 通过解析sku设置.设置provider, region, zone
  initialForm (scope = '', skuObj = {}, duration = '1h', billType = '', isPublicCloud = false, cloudaccountId = '') {
    this.scope = scope
    this.region = skuObj.region_ext_id || ''
    this.zone = skuObj.zone_ext_id || ''
    const d = this.parseDuration(duration, billType)
    this.setPeriod(d.period)
    this.setPriceUnit(d.price_unit)
    this.setProvider(skuObj, isPublicCloud)
    this.setAccount(cloudaccountId, isPublicCloud)
  }

  // parse duration
  parseDuration (duration = '1h', billType = '') {
    let price_unit = 'hour'
    let period = 1
    if (billType === 'package' || billType === 'prepaid') {
      period = parseInt(duration)
      if (duration.toLowerCase().endsWith('w')) price_unit = 'week'
      if (duration.toLowerCase().endsWith('m')) price_unit = 'month'
      if (duration.toLowerCase().endsWith('y')) price_unit = 'year'
    }
    return { period, price_unit }
  }

  // 设置provider
  setProvider (skuObj = {}, isPublicCloud = false) {
    const provider = skuObj.provider || PROVIDER_MAP.OneCloud.key
    if (!isPublicCloud) {
      this.provider = provider
    }
    this.provider = skuObj.cloud_env || provider
  }

  // 设置cloudaccount
  setAccount (cloudaccountId = '', isPublicCloud = false) {
    this.cloudaccountId = cloudaccountId
  }

  // 设置计费时长
  setPeriod (period = 1) {
    this.period = period || 1
  }

  // 设置计费周期. hour|week|month|year
  setPriceUnit (price_unit = 'hour') {
    this.price_unit = price_unit || 'hour'
  }

  addItem ({ resource_type, resource_key = '', amount = 1, disk_type = 'data' }) {
    if (resource_type === 'disk') {
      this.items.push({ resource_type: resource_type, resource_key: resource_key, amount: amount, disk_type })
    } else {
      this.items.push({ resource_type: resource_type, resource_key: resource_key, amount: amount })
    }
  }

  addDisk (sku = '', Gb = 1, type = 'data') {
    this.addItem({ resource_type: 'disk', resource_key: sku, amount: Gb, disk_type: type })
  }

  addDisks (sku = '', sizes = [], type = 'data') {
    sizes.map((sizeGb) => {
      this.addDisk(sku, sizeGb || 0, type)
    })
  }

  addCpu (cores = 1) {
    this.addItem({ resource_type: 'cpu', resource_key: '', amount: cores })
  }

  addMem (Gb = 1) {
    this.addItem({ resource_type: 'mem', resource_key: '', amount: Gb })
  }

  addGpu (spec = '', amount = 1) {
    this.addItem({ resource_type: 'gpu', resource_key: spec, amount: amount })
  }

  addEip (sku = '', amount = 1) {
    this.addItem({ resource_type: 'eip', resource_key: sku, amount: amount })
  }

  addEipBandwidth (sku = '', Mb = 1) {
    this.addItem({ resource_type: 'eip', resource_key: sku ? `bandwidth::${sku}` : 'bandwidth', amount: Mb })
  }

  addServer (sku = '', amount = 1) {
    this.addItem({ resource_type: 'instance', resource_key: sku, amount: amount })
  }

  addRds (sku = '', amount = 1) {
    this.addItem({ resource_type: 'rds', resource_key: sku, amount: amount })
  }

  addRedis (sku = '', amount = 1) {
    this.addItem({ resource_type: 'cache', resource_key: sku, amount: amount })
  }

  async getPriceObj () {
    const data = await this._get_price()
    return new Price(data, this.price_unit, this.period)
  }

  async getPrice () {
    return await this._get_price()
  }

  async _get_price () {
    try {
      const params = {
        scope: this.scope,
        provider: this.provider,
        region: this.region,
        zone: this.zone,
        price_unit: this.price_unit,
        period: this.period,
        cloudaccountId: this.cloudaccountId,
      }
      if (this.price_unit === 'week') {
        params.price_unit = 'hour'
        params.period = this.period * 24 * 7
      }
      this.items.map((item, index) => {
        for (const k in item) {
          params[`items.${index}.${k}`] = item[k]
        }
      })
      const { data } = await this.manager.get({ id: 'total', params })
      return data
    } catch (error) {
      throw error
    }
  }
}

export class PriceFetcherByPriceKey {
  // eslint-disable-next-line
  constructor({ scope = '', priceKey = '', duration = '1h', billType = '', amount = 1, cloudaccountId = '' }) {
    this.priceFetcher = new PriceFetcher({ scope: scope, cloudaccountId })
    const d = this.priceFetcher.parseDuration(duration, billType)
    this.priceFetcher.setPeriod(d.period)
    this.priceFetcher.setPriceUnit(d.price_unit)
    this.init(priceKey, amount)
  }

  init (priceKey = '', amount = 1) {
    const segs = priceKey.split('::')
    let provider = segs[0]
    if (provider.length > 0) {
      provider = provider[0].toUpperCase() + provider.substr(1)
    }
    const resource_key = segs[4] ? segs[4]?.replaceAll('.', '::') : ''
    this.priceFetcher.provider = provider || ''
    this.priceFetcher.region = segs[1] || ''
    this.priceFetcher.zone = segs[2] || ''
    this.priceFetcher.addItem({ resource_type: segs[3] || '', resource_key, amount })
  }

  async getPriceObj () {
    return await this.priceFetcher.getPriceObj()
  }

  async getPrice () {
    return await this.priceFetcher.getPrice()
  }
}

export class Price {
  // eslint-disable-next-line
  constructor(priceObj, price_unit = 'hour', period = 1) {
    this.priceObj = priceObj
    this.price_unit = price_unit || 'hour'
    this.period = period || 1
    this.backupEnable = false
    this.priceFmt = '0,0.00'
    this.count = 1
  }

  setOptions ({ count = 1, backupEnbale = false, priceFmt = '0,0.00' }) {
    this.backupEnable = backupEnbale
    this.count = count
    this.priceFmt = priceFmt || '0,0.00'
  }

  get isPrePaid () {
    return this.price_unit !== 'hour'
  }

  get data () {
    return this.priceObj || { discount: 0 }
  }

  get discount () {
    if (this.priceObj.discount === 1) {
      return 0
    }
    return this.priceObj.discount || 0
  }

  // origin price
  get originPrice () {
    if (!this.priceObj.original_price) return null
    const price = this.priceObj.original_price * this.count
    return this.backupEnable ? price * 2 : price
  }

  // discount price
  get price () {
    if (!this.priceObj.discount_price) return null
    const price = this.priceObj.discount_price * this.count
    return this.backupEnable ? price * 2 : price
  }

  get priceFormat () {
    return (price = 0.0) => {
      const p = numerify(price, this.priceFmt)
      if (this.isPrePaid) {
        return `${this.currency} ${p}`
      }

      const unit = i18n.t('common_11')
      return `${this.currency} ${p}/${unit}`
    }
  }

  get currency () {
    const key = _.get(this.priceObj, ['currency'])
    if (currencyUnitMap[key]) {
      return currencyUnitMap[key].sign
    }
    return currencyUnitMap.CNY.sign
  }

  get priceTips () {
    if (this.price) {
      let _hour = 0
      let _day = 0
      let _month = 0

      const fmt = (num) => { return numerify(num, this.priceFmt) }
      switch (this.price_unit) {
        case 'week':
          _day = this.price / 7 / this.period
          _hour = _day / 24
          return i18n.t('compute.text_1137', [this.currency, fmt(_day), this.currency, fmt(_hour)])
        case 'month':
          _day = this.price / 30 / this.period
          _hour = _day / 24
          return i18n.t('compute.text_1137', [this.currency, fmt(_day), this.currency, fmt(_hour)])
        case 'year':
          _month = this.price / 12 / this.period
          _day = _month / 30
          return i18n.t('compute.text_1138', [this.currency, fmt(_day), this.currency, fmt(_month)])
        default:
          // hour
          _day = this.price * 24 / this.period
          _month = _day * 30 / this.period
          return i18n.t('compute.text_1138', [this.currency, fmt(_day), this.currency, fmt(_month)])
      }
    }
    return '--'
  }
}
