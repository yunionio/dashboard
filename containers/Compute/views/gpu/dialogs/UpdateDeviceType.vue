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
            <a-radio-button v-for="item in gpuTypeList" :key="item.value" :value="item.value">{{ item.label }}</a-radio-button>
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
import { getDeviceGpuType, getGpuTypeSelectOptions, resolveGpuTypeBySharingMode } from '@Compute/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'UpdateDeviceTypeDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const curItem = this.params.data[0]
    const sharingMode = this.params.data.some(item => item.sharing_mode === 'HAMI') ? 'HAMI' : curItem?.sharing_mode
    const initialType = resolveGpuTypeBySharingMode(getDeviceGpuType(curItem) || 'HPC', sharingMode)

    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        type: [
          'type',
          {
            initialValue: initialType,
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
    gpuTypeList () {
      const sharingMode = this.params.data.some(item => item.sharing_mode === 'HAMI') ? 'HAMI' : this.params.data[0]?.sharing_mode
      return getGpuTypeSelectOptions(sharingMode).map(item => ({
        value: item.key,
        label: item.label,
      }))
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
    resolveServerId (item) {
      return item.guest_id || item.server_id || (Array.isArray(item.guest_ids) ? item.guest_ids[0] : null)
    },
    resolveIsolatedDeviceId (item) {
      return item.isolated_device_id || item.device || item.id
    },
    doSubmit (data) {
      const manager = new this.$Manager('isolated_devices')
      const jointsList = this.params.data.map(item => [
        { resource: 'servers', id: this.resolveServerId(item) },
        { resource: 'isolated_devices', id: this.resolveIsolatedDeviceId(item) },
      ])
      return manager.batchJointUpdate({
        jointsList,
        data: { gpu_type: data.type },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
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
