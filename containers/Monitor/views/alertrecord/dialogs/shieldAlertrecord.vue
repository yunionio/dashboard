<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('monitor.alerts.shield.shield') }}</div>
    <div slot="body" class="alertrecord-detail">
      <dialog-selected-tips :name="$t('monitor.text_1')" :count="params.data.length" :action="$t('monitor.alerts.shield.shield')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 4)" />
      <a-form :form="form" hideRequiredMark>
        <a-form-item :label="$t('monitor.alerts.shield.time')" v-bind="formItemLayout">
          <a-radio-group class="mr-3" v-decorator="decorators.time">
            <a-radio-button key="unset" value="unset">{{ $t('compute.text_138') }}</a-radio-button>
            <a-radio-button v-for="item in timeOpts" v-show="!item.hidden" :key="item.key" :value="item.key">{{ item.label }}</a-radio-button>
            <custom-date :customTime.sync="customTime" @click="handleSelected" :time.sync="time" :startTime="moment()" :endTime="moment().add(1, 'days')" :allow-future-time="true" />
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('monitor.alerts.shield.reason')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.description" :placeholder="$t('common.tips.optional_input', [$t('monitor.alerts.shield.reason')])" />
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
import moment from 'moment'
import { timeOpts } from '@/constants/monitor'
import CustomDate from '@/sections/CustomDate'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ShieldAlertrecord',
  components: { CustomDate },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      moment: moment,
      loading: false,
      timeOpts,
      customTime: null,
      form: this.$form.createForm(this),
      decorators: {
        time: [
          'time',
          {
            initialValue: 'unset',
            rules: [
              { required: true, message: `${this.$t('common.select')}` },
            ],
          }],
        description: [
          'description',
          {
            initialValue: '',
          }],
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
    handleSelected (v) {
      this.form.setFieldsValue({ time: v })
    },
    parseTime (v) {
      let hours = 0
      if (v) {
        hours = parseInt(v.replace('now', ''))
      }

      return moment().add(hours, 'Hours').format('YYYY-MM-DD HH:mm')
    },
    parseTimeStr (timeStr) {
      const t = { start_time: undefined, end_time: undefined }
      if (timeStr === 'unset') {
        return t
      } else if (timeStr === 'custom') {
        t.start_time = this.parseTime(this.customTime.from)
        t.end_time = this.parseTime(this.customTime.to)
      } else {
        t.start_time = this.parseTime()
        t.end_time = this.parseTime(timeStr)
      }

      return t
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.validateFields()
        const { start_time, end_time } = this.parseTimeStr(values.time)
        const params = {
          alert_id: this.params.data[0].alert_id,
          res_name: this.params.data[0].res_name,
          res_id: this.params.data[0].monitor_resource_id,
          start_time: start_time,
          end_time: end_time,
          description: values.description,
        }
        await new this.$Manager('alertrecordshields', 'v1').create({ data: params })
        if (this.params.refresh && typeof this.params.refresh === 'function') {
          this.params.refresh()
        }
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style scoped>
</style>
