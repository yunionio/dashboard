<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">克隆</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" action="克隆" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item label="虚拟CPU核数" v-bind="formItemLayout">
          <a-input-number :min="1" :max="100000" v-decorator="decorators.cpu_core_count" /> 核
        </a-form-item>
        <a-form-item label="虚拟内存容量" v-bind="formItemLayout">
          <a-input-number :min="1" :max="100000" v-decorator="decorators.memory_size_mb" /> GB
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
  name: 'CloneSkuUpdateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        cpu_core_count: [
          'cpu_core_count',
          {
            initialValue: this.params.data[0].cpu_core_count,
          },
        ],
        memory_size_mb: [
          'memory_size_mb',
          {
            initialValue: this.params.data[0].memory_size_mb / 1024,
          },
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
    doCreate (data) {
      return this.params.list.onManager('create', {
        managerArgs: {
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        let values = await this.validateForm()
        values = {
          ...values,
          memory_size_mb: values.memory_size_mb * 1024,
          brand: this.params.data[0].brand,
        }
        console.log(values)
        this.loading = true
        await this.doCreate(values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
