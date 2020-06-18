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
      <!-- <div>费用估算</div> -->
    </template>
    <template v-slot:right>
      <div class="d-flex align-items-center">
          <div class="mr-4 d-flex align-items-center">
            <div class="text-truncate">费用估算：</div>
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
        <a-button @click="doCreate" :loading="loading" type="primary" class="ml-3">新建</a-button>
      </div>
      <!-- <transition>
        <div v-if="errors.length" class="errors-wrap" v-clickoutside="closeError">
          <div class="title d-flex align-items-center">
            <i class="el-icon-error mr-2" />
            <span>新建主机失败</span>
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

export default {
  name: 'BottomBar',
  inject: ['form'],
  props: {
    values: {
      type: Object,
    },
  },
  data () {
    return {
      loading: false,
    }
  },
  computed: {
    tips () {
      const { count, sku = {} } = this.values
      const category = sku.local_category
      const ret = [
        [
          { label: '名称', labelClass: 'label-w-50', value: this.values.generate_name, valueClass: 'name-value' },
          { label: '数量', labelClass: 'label-w-50', value: count },
        ],
        [
          { label: '区域', labelClass: 'label-w-50', value: sku.region },
          { label: '实例类型', labelClass: 'label-w-50', value: ENGINE_ARCH[category] },
        ],
        [
          { label: '配置', labelClass: 'label-w-80', value: `${sizestrWithUnit(sku.memory_size_mb, 'M', 1024)}内存` },
          { label: '类型版本', labelClass: 'label-w-80', value: `${this.values.engine || '-'}${this.values.engine_version || ''}` },
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
      if (this.rate && count) {
        const { month_price: month, hour_price: hour } = this.rate
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
          return `(合¥${_day}/天  ¥${_hour}/小时)`
        } else {
          const _day = (this.price * 24).toFixed(2)
          const _month = (parseFloat(_day) * 30).toFixed(2)
          return `(合¥${_day}/天 ¥${_month}/月)`
        }
      }
      return '--'
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
      ret += !this.isPackage ? ' / 时' : ''
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
      // 到期释放
      if (params.durationStandard !== 'none') {
        params.duration = params.duration || params.durationStandard
      }
      delete params.durationStandard
      return params
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

<style lang="scss" scoped>
@import '../../../../../../src/styles/_variables.scss';

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
        color: $error-color;
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
      color: $error-color;
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
      color: $error-color;
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
      color: $error-color;
      font-size: 24px;
    }
    .tips {
      color: #999;
      font-size: 12px;
    }
  }
</style>
