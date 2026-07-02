<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :name="params.name || $t('dictionary.server')" :count="params.data.length" :action="params.title" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('compute.force_detach')" v-if="isGuestHasUnknown || isGuestHasReady" v-bind="formItemLayout">
          <a-tooltip v-if="isGuestHasUnknown" :title="$t('compute.force_detach_tooltip')">
            <a-switch :checkedChildren="$t('compute.text_115')" disabled :unCheckedChildren="$t('compute.text_116')" v-decorator="decorators.is_force" />
          </a-tooltip>
          <a-switch v-else :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-decorator="decorators.is_force" @change="onForceChange" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_494')" v-if="isShowAutoStart" v-bind="formItemLayout" :extra="$t('compute.text_495')">
          <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" :disabled="isForceChecked" v-decorator="decorators.autoStart" />
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
      isForceChecked: this.params.data.some(o => o.guest_status === 'unknown'),
      autoStartSnapshot: null,
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
        is_force: [
          'is_force',
          {
            valuePropName: 'checked',
            initialValue: this.params.data.some(o => o.guest_status === 'unknown'),
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
    isGuestHasUnknown () {
      return this.selectedItems.some(o => o.guest_status === 'unknown')
    },
    isGuestHasReady () {
      return this.selectedItems.some(o => o.guest_status === 'ready')
    },
  },
  mounted () {
    if (this.isForceChecked) {
      this.form.fc.setFieldsValue({ autoStart: false })
    }
  },
  methods: {
    onForceChange (checked) {
      if (checked) {
        this.autoStartSnapshot = this.form.fc.getFieldValue('autoStart')
        this.form.fc.setFieldsValue({ autoStart: false })
      } else {
        this.form.fc.setFieldsValue({ autoStart: this.autoStartSnapshot ?? true })
        this.autoStartSnapshot = null
      }
      this.isForceChecked = checked
    },
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
    doUpdate (values, device) {
      const data = {
        auto_start: this.isShowAutoStart ? values.autoStart : false,
        device: device ? device.id : this.params.device.id,
      }
      if (values.is_force) {
        data.is_force = true
      }
      return new this.$Manager('servers').performAction({
        id: device ? device.guest_id : this.params.data[0].id,
        action: 'detach-isolated-device',
        data,
      })
    },
    async handleConfirm () {
      try {
        this.loading = true
        const values = await this.validateForm()
        if (this.params.devices) {
          for (let i = 0; i < this.params.devices.length; i++) {
            await this.doUpdate(values, this.params.devices[i])
          }
        } else {
          if (this.params.data.length === 1) {
            await this.doUpdate(values)
          } else {
            await this.doDetachSubmit(values)
          }
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
