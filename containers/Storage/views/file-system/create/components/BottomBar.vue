<template>
  <page-footer>
    <template v-slot:right>
      <price-fetcher :values="values" :cloudAccountId="cloudAccountId" />
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
import PriceFetcher from '@/components/PriceFetcher'

export default {
  name: 'BottomBar',
  components: {
    PriceFetcher,
  },
  inject: ['form'],
  props: {
    values: {
      type: Object,
    },
    cloudAccountId: String,
    loading: Boolean,
  },
  data () {
    return {}
  },
  computed: {
    ...mapGetters(['userInfo']),
  },
  methods: {
    async handleConfirm () {
      this.$emit('submit')
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
