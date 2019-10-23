<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">续费</div>
    <div slot="body">
      <a-form :form="form.fc">
        <billing-opts />
      </a-form>
    </div>
    <div slot="footer">
      <a-button :loading="loading" @click="handleConfirm" type="primary">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import BillingOpts from '../components/BillingOpts'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'RedisRenewDialog',
  components: {
    BillingOpts,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        boot_order: [
          'boot_order',
          {
            rules: [
              { required: true, message: '请选择启动介质' },
            ],
          },
        ],
      },
    }
  },
  computed: {
    isKvm () {
      return this.params.data.length >= 1 && this.params.data[0].hypervisor === 'kvm'
    },
  },
  created () {
    // this.initFormValue(this.params.data[0])
  },
  methods: {
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        const ids = this.params.data.map(item => item.id)
        await this.params.list.onManager('batchUpdate', {
          id: ids,
          managerArgs: {
            data: values,
          },
        })
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
    initFormValue (data) {
      this.$nextTick(() => {
        const updateObj = {
          disable_delete: data.disable_delete,
        }
        if (this.isKvm) {
          updateObj.boot_order = data.boot_order
          updateObj.bios = data.bios
        }
        this.form.fc.setFieldsValue(updateObj)
      })
    },
  },
}
</script>
