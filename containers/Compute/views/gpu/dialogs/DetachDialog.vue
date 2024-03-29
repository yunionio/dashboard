<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('compute.text_113')" :count="params.data.length" :action="params.title" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('compute.text_494')" v-if="isShowAutoStart" v-bind="formItemLayout" :extra="$t('compute.text_495')">
          <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-decorator="decorators.autoStart" />
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
  name: 'DetachGpuDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        autoStart: [
          'autoStart',
          {
            valuePropName: 'checked',
            initialValue: true,
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
  computed: {
    selectedItems () {
      return this.params.data
    },
    isGuestAllRunning () {
      return this.selectedItems.every(o => o.guest_status === 'running')
    },
    isShowAutoStart () {
      return !this.isGuestAllRunning
    },
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
    doUpdate (values) {
      return new this.$Manager('servers').performAction({
        id: this.params.data[0].guest_id,
        action: 'detach-isolated-device',
        data: {
          auto_start: this.isShowAutoStart ? values.autoStart : false,
          device: this.params.data[0].id,
        },
      })
    },
    async handleConfirm () {
      try {
        this.loading = true
        const values = await this.validateForm()
        if (this.params.data.length === 1) {
          await this.doUpdate(values)
        } else {
          await this.doDetachSubmit(values)
        }
        this.loading = false
        this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
    doDetachSubmit (values) {
      const data = {
        detach_all: true,
        auto_start: this.isShowAutoStart ? values.autoStart : false,
      }
      const selectedIds = this.params.data.map((item) => {
        return item.guest_id
      })
      return new this.$Manager('servers').batchPerformAction({
        ids: selectedIds,
        action: 'detach-isolated-device',
        data,
      })
    },
  },
}
</script>
