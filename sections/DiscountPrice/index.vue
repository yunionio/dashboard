<template>
  <div v-if="discount !== 0">
    <div class="lh-1">{{ $t('common.discount_unit', [discountFormatValue]) }}</div>
    <div class="lh-1 mt-1 text-color-help"><del>{{ origin }}</del></div>
  </div>
</template>

<script>
import numerify from 'numerify'

export default {
  name: 'DiscountPrice',
  props: {
    discount: {
      type: Number,
      default: 0,
    },
    origin: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    discountFormatValue () {
      const lang = this.$store.getters.setting.language
      const isZh = lang === 'zh-CN'
      let discountFormatValue
      if (isZh) {
        discountFormatValue = numerify((1 - this.discount) * 10, '0.0')
      } else {
        discountFormatValue = Math.round(this.discount * 100)
      }
      return discountFormatValue
    },
  },
}
</script>
