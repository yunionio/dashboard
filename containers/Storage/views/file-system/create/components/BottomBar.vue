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
    ...mapGetters(['userInfo']),
  },
  methods: {
    doCreate (data) {
      return new this.$Manager('file_systems').create({ data })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const params = {
          billing_type: values.billing_type,
          name: values.name,
          description: values.description,
          network_id: values.network,
          zone_id: values.zone_id,
          project_domain: values.project_domain,
        }
        if (values.sku) {
          params.file_system_type = values.sku.file_system_type
          params.protocol = values.sku.protocol
          params.storage_type = values.sku.storage_type
        }
        if (values.capacity > 0) {
          params.capacity = values.capacity
        }
        if (values.billing_type === 'postpaid') {
          if (values.durationStandard !== 'none') {
            params.duration = values.durationStandard
            if (values.durationStandard === 'custom') {
              params.duration = values.duration
            }
          }
          if (values.auto_renew) {
            params.auto_renew = values.auto_renew
          }
        } else {
          params.duration = values.duration
        }

        await this.doCreate(params)
        this.loading = false
        this.$message.success(this.$t('network.nat.create.success'))
        this.$router.push('/nas')
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
