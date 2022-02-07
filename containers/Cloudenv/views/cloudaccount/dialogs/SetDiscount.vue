<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('cloudaccount.table.action.set_discount')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('res.cloudaccount')" :count="params.data.length" :action="$t('cloudaccount.table.action.set_discount')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form-model
        ref="form"
        :model="fd"
        :rules="rules"
        v-bind="formItemLayout">
        <a-form-model-item :label="$t('cloudaccount.table.title.discount')" prop="discount" :extra="$t('cloudenv.text_571')">
          <a-input-number
            :value="fd.discount"
            :min="0"
            :max="100"
            :step="0.01"
            :precision="2"
            :formatter="value => `${value}%`"
            :parser="value => value.replace('%', '')"
            @change="discountChange" />
        </a-form-model-item>
      </a-form-model>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'CloudaccountSetDiscountDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      discountLoaded: false,
      fd: {
        discount: 100,
      },
      rules: {
        discount: [
          { required: true, message: this.$t('cloudaccount.validate.discount') },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
    }
  },
  created () {
    this.fetchDiscount()
  },
  methods: {
    discountChange (value) {
      this.fd.discount = value
    },
    async fetchDiscount () {
      try {
        const response = await this.$http({
          method: 'GET',
          url: `/v1/price_infos/discount/${this.params.data[0].id}`,
        })
        this.fd.discount = (response.data.discount * 100).toFixed(2)
      } finally {
        this.discountLoaded = true
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        await this.$refs.form.validate()
        await this.$http({
          method: 'PUT',
          url: `/v1/price_infos/discount/${this.params.data[0].id}`,
          data: {
            discount: this.fd.discount * 100 / 10000,
          },
        })
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
