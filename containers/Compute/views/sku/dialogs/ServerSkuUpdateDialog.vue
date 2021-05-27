<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.sku')" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form :form="form.fc" hideRequiredMark v-bind="formItemLayout">
        <a-form-item :label="$t('compute.sku.postpaid_status')">
          <a-radio-group v-model="postpaid">
            <a-radio :value="available">{{ $t('status.sku.available') }}</a-radio>
            <a-radio :value="soldout">{{ $t('status.sku.soldout') }}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('compute.sku.prepaid_status')">
          <a-radio-group v-model="prepaid">
            <a-radio :value="available">{{ $t('status.sku.available') }}</a-radio>
            <a-radio :value="soldout">{{ $t('status.sku.soldout') }}</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
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
  name: 'ServerSkuUpdateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      action: this.$t('compute.sku.setup.sell.status'),
      form: {
        fc: this.$form.createForm(this),
      },
      available: 'available',
      soldout: 'soldout',
      postpaid: 'available',
      prepaid: 'available',
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
    }
  },
  computed: {
    columns () {
      const showFields = ['name', 'prepaid_status', 'postpaid_status']
      return this.params.columns.filter((item) => { return showFields.includes(item.field) })
    },
  },
  created () {
    try {
      const { data = [] } = this.params
      if (data.length === 1) {
        const { prepaid_status, postpaid_status } = data[0]
        this.postpaid = postpaid_status
        this.prepaid = prepaid_status
      }
    } catch (err) {}
  },
  methods: {
    async doUpdate () {
      const ids = this.params.data.map(item => item.id)
      return this.params.onManager('batchUpdate', {
        id: ids,
        managerArgs: {
          data: {
            prepaid_status: this.prepaid,
            postpaid_status: this.postpaid,
          },
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        await this.doUpdate()
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
