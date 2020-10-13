<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <div slot="message">
          {{$t('common.text00059')}} <br />
          {{$t('common.text00060')}}
        </div>
      </a-alert>
      <dialog-selected-tips :name="name" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('common.text00061')" v-bind="formItemLayout">
          <a-switch :checkedChildren="$t('common.text00062')" :unCheckedChildren="$t('common.text00063')" v-decorator="decorators.durationEnable" />
        </a-form-item>
        <a-form-item
          v-if="form.fd.durationEnable"
          :label="$t('common.text00064')"
          v-bind="formItemLayout"
          :help="help">
          <div @click="openDatePicker">
            <a-date-picker
              v-decorator="decorators.durationDate"
              :disabledDate="disabledDate"
              :disabledTime="disabledDateTime"
              :open="open"
              @change="dateChangeHandle"
              format="YYYY-MM-DD HH:mm"
              :showTime="{ format: 'HH:mm' }">
              <template slot="renderExtraFooter">
                {{$t('common.text00065')}}<a-tag color="blue" style="border-radius: 10px;" :class="{ active: currentDuration === v.value }" v-for="v in durationArrs" :key="v.value" @click="chooseDurationHandle(v)">{{v.text}}</a-tag>
                <p class="ant-calendar-ok-btn" style="position: absolute; right: 13px; top: 83px; padding: 0 8px; z-index: 999;" @click="closeDatePicker">{{$t('common.ok')}}</p>
              </template>
            </a-date-picker>
          </div>
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
import * as R from 'ramda'
import moment from 'moment'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'SetDurationDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const expiredAtSort = R.sortWith([
      R.descend(R.prop('expired_at')),
    ])
    const datas = expiredAtSort(this.params.data)
    const expireDate = datas[0].expired_at ? moment(datas[0].expired_at) : moment()
    return {
      loading: false,
      action: this.$t('common.text00061'),
      form: {
        fc: this.$form.createForm(this, { onValuesChange: this.onValuesChange }),
        fd: {
          durationEnable: false,
          durationDate: expireDate,
        },
      },
      currentDuration: '',
      expireDate,
      decorators: {
        durationEnable: [
          'durationEnable',
          {
            initialValue: false,
            valuePropName: 'checked',
          },
        ],
        durationDate: [
          'durationDate',
          {
            initialValue: expireDate,
            rules: [
              { required: true, message: this.$t('common.text00066') },
            ],
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
      open: false,
    }
  },
  computed: {
    help () {
      return this.$t('common.text00067')
    },
    durationArrs () {
      return Object.keys(this.$t('durations')).map(k => ({
        value: k,
        text: this.$t('durations')[k],
      }))
    },
    name () {
      return this.params.name || this.$t('dictionary.server')
    },
  },
  watch: {
    'form.fd.durationEnable' (val) {
      this.open = false
    },
  },
  created () {
    if (this.params.data[0].expired_at !== undefined) {
      this.$nextTick(() => {
        this.form.fc.setFieldsValue({ durationEnable: true })
      })
    }
  },
  methods: {
    async doUpdateSubmit (data) {
      const time = this.$moment.utc(data.durationDate).format()
      const params = {
        expire_time: time,
      }
      const ids = this.params.data.map(item => item.id)
      return this.params.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: ['running', 'ready'],
        managerArgs: {
          action: 'postpaid-expire',
          data: params,
        },
      })
    },
    async doCancelExpireSubmit () {
      const params = {}
      const ids = this.params.data.map(item => item.id)
      return this.params.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: ['running', 'ready'],
        managerArgs: {
          action: 'cancel-expire',
          data: params,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        if (this.form.fd.durationEnable) {
          const values = await this.form.fc.validateFields()
          await this.doUpdateSubmit(values)
        } else {
          await this.doCancelExpireSubmit()
        }
        this.loading = false
        this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
    onValuesChange (props, values) {
      Object.keys(values).forEach((key) => {
        this.form.fd[key] = values[key]
      })
    },
    range (start, end) {
      const result = []
      for (let i = start; i < end; i++) {
        result.push(i)
      }
      return result
    },
    disabledDate (current) {
      // can not select days before today
      return current && current < moment(this.expireDate)
    },
    disabledDateTime (current) {
      let currentHour = moment(this.expireDate).hour()
      if (moment().date() !== current.date() || moment(this.expireDate).date() !== current.date()) {
        currentHour = 0
      }
      return {
        disabledHours: () => this.range(0, currentHour),
        // disabledMinutes: () => this.range(0, 60),
        // disabledSeconds: () => this.range(0, 60),
      }
    },
    chooseDurationHandle (v) {
      this.currentDuration = v.value
      const durationDate = R.clone(this.expireDate)
      switch (v.value) {
        case '1h':
          durationDate.add(1, 'h')
          break
        case '2h':
          durationDate.add(2, 'h')
          break
        case '3h':
          durationDate.add(3, 'h')
          break
        case '6h':
          durationDate.add(6, 'h')
          break
        case '1d':
          durationDate.add(1, 'd')
          break
        case '2d':
          durationDate.add(2, 'd')
          break
        case '1w':
          durationDate.add(1, 'w')
          break
      }
      this.form.fc.setFieldsValue({ durationDate: durationDate })
    },
    dateChangeHandle (v) {
      this.currentDuration = ''
    },
    openDatePicker () {
      this.open = true
    },
    closeDatePicker () {
      this.open = false
    },
  },
}
</script>

<style lang="scss" scoped>
.ant-tag-blue {
  background: none;
  &.active {
    background: #e6f7ff;
  }
}
</style>
