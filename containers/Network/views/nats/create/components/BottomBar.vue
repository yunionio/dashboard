<template>
  <page-footer>
    <template v-slot:right>
      <price-fetcher :values="values" />
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
  inject: ['form', 'cloudEnv'],
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
    ...mapGetters(['userInfo']),
  },
  methods: {
    doCreate (data) {
      return new this.$Manager('natgateways').create({ data })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const params = {
          project_domain: values.project_domain,
          name: values.name,
          description: values.description,
          cloudregion_id: values.cloudregion_id,
          network_id: values.network,
          vpc_id: values.vpc,
          nat_spec: values.sku.name,
          billing_type: values.billing_type,
        }
        if (params.billing_type === 'postpaid') {
          if (values.durationStandard !== 'none') {
            params.duration = values.durationStandard
            if (values.durationStandard === 'custom') {
              params.duration = values.duration
            }
          }
        } else {
          params.duration = values.duration
        }
        if (values.bandwidth && values.bandwidth > 0) {
          params.eip_bw = values.bandwidth
        }
        if (values.charge_type) {
          params.eip_charge_type = values.charge_type
        }
        await this.doCreate(params)
        this.loading = false
        this.$message.success(this.$t('network.nat.create.success'))
        this.$router.push('/nat')
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
