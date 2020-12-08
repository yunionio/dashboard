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
      <!-- <div>{{$t('db.text_263')}}</div> -->
    </template>
    <template v-slot:right>
      <div class="d-flex align-items-center">
          <div class="mr-4 d-flex align-items-center">
            <div class="text-truncate">{{$t('db.text_108')}}</div>
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
        <a-button @click="doCreate" :loading="loading" type="primary" class="ml-3">{{$t('db.text_41')}}</a-button>
      </div>
      <!-- <transition>
        <div v-if="errors.length" class="errors-wrap" v-clickoutside="closeError">
          <div class="title d-flex align-items-center">
            <i class="el-icon-error mr-2" />
            <span>{{$t('db.text_264')}}</span>
          </div>
          <div class="divider" />
          <ul class="list">
            <li
              v-for="(item, idx) of errors"
              :key="idx">
              <div>{{ item.message }}</div>
              <ul class="list sec-list" v-if="item.children">
                <li v-for="(child, childIdx) of item.children" :key="`child-${childIdx}`">{{ child }}</li>
              </ul>
            </li>
          </ul>
        </div>
      </transition> -->
    </template>
  </page-footer>
</template>
<script>
// import * as R from 'ramda'
// import _ from 'lodash'
import { ENGINE_ARCH, BILL_TYPES_MAP } from '@DB/views/redis/constants'
import { sizestrWithUnit } from '@/utils/utils'
import { Manager } from '@/utils/manager'
import DiscountPrice from '@/sections/DiscountPrice'

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
      priceTotal: null,
      loading: false,
    }
  },
  computed: {
    tips () {
      const { count, sku = {} } = this.values
      const category = sku.local_category
      const ret = [
        [
          { label: this.$t('db.text_60'), labelClass: 'label-w-50', value: this.values.generate_name, valueClass: 'name-value' },
          { label: this.$t('db.text_265'), labelClass: 'label-w-50', value: count },
        ],
        [
          { label: this.$t('db.text_40'), labelClass: 'label-w-50', value: sku.region },
          { label: this.$t('db.text_119'), labelClass: 'label-w-50', value: ENGINE_ARCH[category] },
        ],
        [
          { label: this.$t('db.text_109'), labelClass: 'label-w-80', value: this.$t('db.text_110', [sizestrWithUnit(sku.memory_size_mb, 'M', 1024)]) },
          { label: this.$t('db.text_112'), labelClass: 'label-w-80', value: `${this.values.engine || '-'}${this.values.engine_version || ''}` },
        ],
      ]
      return ret
    },
    sku  () {
      return this.values.sku || null
    },
    isPackage () {
      return this.values.billing_type === BILL_TYPES_MAP.prepaid.key
    },
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
      return 0
    },
    price () {
      const { count } = this.values
      if (this.rate && count && this.priceTotal) {
        const { month_price: month } = this.rate
        const { hour_price: hour } = this.priceTotal
        if (this.isPackage && this.durationNum) {
          return parseFloat(month) * parseFloat(count) * this.durationNum
        }
        return parseFloat(hour) * parseFloat(count)
      }
      return null
    },
    originPrice () {
      const { count } = this.values
      if (this.priceTotal && count) {
        const { month_gross_price: month, hour_gross_price: hour } = this.priceTotal
        if (this.isPackage && this.durationNum) {
          return parseFloat(month) * parseFloat(count) * this.durationNum
        }
        return parseFloat(hour) * parseFloat(count)
      }
      return null
    },
    priceTips () {
      if (this.price) {
        if (this.isPackage && this.durationNum) {
          const _day = (this.price / 30 / this.durationNum).toFixed(2)
          const _hour = (parseFloat(_day) / 24).toFixed(2)
          return this.$t('db.text_266', [_day, _hour])
        } else {
          const _day = (this.price * 24).toFixed(2)
          const _month = (parseFloat(_day) * 30).toFixed(2)
          return this.$t('db.text_267', [_day, _month])
        }
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
    validateForm () {
      let f = false
      this.form.fc.validateFieldsAndScroll({ scroll: { alignWithTop: true, offsetTop: 100 } }, (err, values) => {
        f = err === null
      })
      return f
    },
    formatToPrice (val) {
      let ret = `¥ ${val.toFixed(2)}`
      ret += !this.isPackage ? this.$t('db.text_115') : ''
      return ret
    },
    formatParams () {
      const params = {
        ...this.values,
      }
      if (params.sku) {
        params.cloudregion = params.sku.cloudregion_id
        params.zone = params.sku.zone_id
        params.engine_version = params.sku.engine_version
        params.engine = params.sku.engine
        params.instance_type = params.sku.id
      }
      if (params.loginType === 'random') {
        params.reset_password = true
        delete params.loginType
      }
      params.__count__ = params.count
      params.billing_cycle = params.duration
      delete params.sku
      params.secgroup_ids = params.secgroup
      delete params.secgroup
      // 到期释放
      if (params.durationStandard !== 'none') {
        params.duration = params.duration || params.durationStandard
      }
      delete params.durationStandard
      return params
    },
    async _getPrice (price_key) {
      try {
        const { data } = await new this.$Manager('price_infos', 'v1').get({
          id: 'total',
          params: {
            price_keys: [price_key],
          },
        })
        this.priceTotal = data
      } catch (err) {
        throw err
      }
    },
    async doCreate () {
      if (!this.validateForm()) return false
      const manager = new Manager('elasticcaches', 'v2')
      this.loading = true
      try {
        await manager.create({ data: this.formatParams() })
        this.$router.push('/redis')
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
