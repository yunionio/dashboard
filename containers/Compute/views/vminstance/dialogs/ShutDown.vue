<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form
        :form="form.fc" v-show="canStopPaying">
        <a-form-item class="mb-0">
          <a-checkbox
          :checked="form.fd.stopPaying"
          @change="stopPayingChange">
            {{$t('compute.shutdown_stop_paying')}}
          </a-checkbox>
          <help-tooltip name="shutdownStopCharging" />
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
  name: 'VmShutDownDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      action: this.$t('compute.text_273'),
      form: {
        fc: this.$form.createForm(this),
        fd: {
          stopPaying: false,
        },
      },
      decorators: {
        stopPaying: [
          'stopPaying',
          {
            valuePropName: 'checked',
            initialValue: false,
          },
        ],
      },
    }
  },
  computed: {
    columns () {
      const showFields = ['name', 'ip', 'instance_type']
      return this.params.columns.filter((item) => { return showFields.includes(item.field) })
    },
    // 腾讯云、阿里云的按量付费机器，关机可停止付费
    canStopPaying () {
      const canStopPayingBrands = ['qcloud', 'aliyun']
      return this.params.data.every(item => {
        return canStopPayingBrands.includes(item.brand.toLocaleLowerCase()) && item.billing_type === 'postpaid'
      })
    },
  },
  methods: {
    async doShutDownSubmit () {
      const data = {}
      if (this.form.fd.stopPaying) {
        data.stop_charging = true
      }
      const ids = this.params.data.map(item => item.id)
      return this.params.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: 'ready',
        managerArgs: {
          action: 'stop',
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        await this.doShutDownSubmit()
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
    stopPayingChange (val) {
      const { checked } = val.target
      this.form.fd.stopPaying = checked
    },
  },
}
</script>
