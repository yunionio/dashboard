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
    isShowAutoStart () {
      return !this.params.data.every(o => o.guest_status === 'running')
    },
    isGuestHasUnknown () {
      return this.params.data.some(o => o.guest_status === 'unknown')
    },
    isGuestHasReady () {
      return this.params.data.some(o => o.guest_status === 'ready')
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
    async fetchGuestIsolatedDeviceIndexs (bind) {
      const guestId = bind.server_id
      const deviceId = bind.gpu_ids.length
      if (!guestId || !deviceId) return undefined
      try {
        const res = await new this.$Manager('guestisolateddevices').list({
          params: {
            limit: 0,
            guest_id: guestId,
            scope: this.$store.getters.scope,
          },
        })
        const record = (res.data.data || []).filter(item => bind.gpu_ids.includes(item.id) || bind.gpu_ids.includes(item.isolated_device_id))
        return record.map(item => {
          return {
            device: item.id || item.isolated_device_id,
            index: item.index,
          }
        })
      } catch (e) {
        // ignore
      }
      return undefined
    },
    async doUpdate (values, bind) {
      const data = {
        auto_start: this.isShowAutoStart ? values.autoStart : false,
      }
      if (values.is_force) {
        data.is_force = true
      }
      const index = await this.fetchGuestIsolatedDeviceIndexs(bind)
      if (index !== undefined) {
        data.devices = index
      }
      return new this.$Manager('servers').performAction({
        id: bind.server_id,
        action: 'detach-isolated-device',
        data,
      })
    },
    async handleConfirm () {
      try {
        this.loading = true
        const values = await this.validateForm()
        if (this.params.binds) {
          for (let i = 0; i < this.params.binds.length; i++) {
            await this.doUpdate(values, this.params.binds[i])
          }
        }
        this.loading = false
        this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
