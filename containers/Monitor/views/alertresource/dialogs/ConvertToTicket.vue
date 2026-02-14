<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('monitor.convert_to_ticket') }}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="$t('monitor.convert_to_ticket')" :name="$t('monitor.text_17')" />
      <dialog-table v-if="params.columns && params.columns.length" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form-model ref="form" :model="form" :rules="rules" v-bind="formItemLayout">
        <a-form-model-item :label="$t('monitor.alert_ticket_type')">
          <a-radio-group v-model="form.ticket_type">
            <template v-if="params.enabledKeys.includes('alert-event')">
              <a-tooltip v-if="!params.activeKeys.includes('alert-event')" :title="$t('monitor.convert_to_ticket.alert_event_disabled_tip')">
                <a-radio-button :disabled="true" value="alert-event">{{ $t('monitor.alert_ticket_type.alert_event') }}</a-radio-button>
              </a-tooltip>
              <a-radio-button v-else value="alert-event">{{ $t('monitor.alert_ticket_type.alert_event') }}</a-radio-button>
            </template>
            <template v-if="params.enabledKeys.includes('alert-ticket')">
              <a-tooltip v-if="!params.activeKeys.includes('alert-ticket')" :title="$t('monitor.convert_to_ticket.alert_ticket_disabled_tip')">
                <a-radio-button :disabled="true" value="alert-ticket">{{ $t('monitor.alert_ticket_type.alert_ticket') }}</a-radio-button>
              </a-tooltip>
              <a-radio-button v-else value="alert-ticket">{{ $t('monitor.alert_ticket_type.alert_ticket') }}</a-radio-button>
            </template>
          </a-radio-group>
        </a-form-model-item>
      </a-form-model>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'AlertResourceConvertToTicketDialog',
  components: {
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      form: {
        ticket_type: this.params.activeKeys[0],
      },
    }
  },
  computed: {
  },
  created () {
    this.$mT = new this.$Manager('monitorresources')
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        await this.$mT.performAction({
          id: this.params.data[0].monitor_resource_object_id,
          action: 'do-action',
          data: {
            action: 'sync-process-instance',
            data: {
              definition_key: this.form.ticket_type,
              alert_id: this.params.data[0].alert_id,
              metric: this.params.data[0].metric,
            },
          },
        })
        this.params.refresh()
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
