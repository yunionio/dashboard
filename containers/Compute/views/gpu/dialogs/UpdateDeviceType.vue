<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('gpu.device_type.update') }}</div>
    <div slot="body">
      <a-alert type="warning" class="mb-2">
        <template v-slot:message>
          <div class="messages-list">
            <p>{{ $t('gpu.device_type.message_1') }}</p>
            <p>{{ $t('gpu.device_type.message_2') }}</p>
            <p>{{ $t('gpu.device_type.message_3') }}</p>
          </div>
        </template>
      </a-alert>
      <dialog-selected-tips :name="$t('compute.text_113')" :count="params.data.length" :action="$t('gpu.device_type.update')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('gpu.device_type')">
          <a-radio-group v-decorator="decorators.type">
            <a-radio-button value="GPU-HPC">GPU-HPC</a-radio-button>
            <a-radio-button value="GPU-VGA">GPU-VGA</a-radio-button>
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
  name: 'UpdateDeviceTypeDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const curItem = this.params.data[0]

    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        type: [
          'type',
          {
            initialValue: curItem.dev_type || 'GPU-HPC',
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
    doSubmit (data) {
      const ids = this.params.data.map((item) => item.id)
      return new this.$Manager('isolated_devices').batchUpdate({
        ids,
        data: {
          dev_type: data.type,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        this.loading = true
        await this.doSubmit(values)
        this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.messages-list p {
  margin-bottom: 4px;
}
</style>
