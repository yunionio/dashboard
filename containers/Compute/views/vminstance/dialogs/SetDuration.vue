<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <div slot="message">
          1. 释放时间目前支持最小单位为1小时，不足1小时按1小时设置 <br /> 2. 实际释放时间与设置时间存在一定误差，具体释放时间以实际为准
        </div>
      </a-alert>
      <dialog-selected-tips :count="params.data.length" :action="action" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item label="到期释放" v-bind="formItemLayout">
          <a-switch v-decorator="decorators.durationEnable" />
        </a-form-item>
        <a-form-item
          v-if="form.fd.durationEnable"
          label="释放时间"
          v-bind="formItemLayout">
          <a-date-picker
            v-decorator="decorators.durationDate"
            :disabledDate="disabledDate"
            :disabledTime="disabledDateTime"
            showTime>
            <template slot="renderExtraFooter">
              快速选择：<a-tag color="blue" v-for="v in durationArrs" :key="v.value" @click="chooseDurationHandle(v)">{{v.text}}</a-tag>
            </template>
          </a-date-picker>
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
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'VmSetDurationDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const expireDate = this.params.data[0].expired_at ? moment(this.params.data[0].expired_at) : moment()
    return {
      loading: false,
      action: '到期释放',
      form: {
        fc: this.$form.createForm(this, { onValuesChange: this.onValuesChange }),
        fd: {
          durationEnable: false,
          durationDate: expireDate,
        },
      },
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
              { required: true, message: '请选择释放时间' },
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
      durationArrs: [
        { value: '1h', text: '1小时' },
        { value: '2h', text: '2小时' },
        { value: '3h', text: '3小时' },
        { value: '6h', text: '6小时' },
        { value: '1d', text: '1天' },
        { value: '2d', text: '2天' },
        { value: '1w', text: '1周' },
      ],
    }
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
      const diffHours = data.durationDate.diff(this.expireDate)
      const params = {
        duration: `${diffHours < 1 ? 1 : diffHours}h`,
      }
      const ids = this.params.data.map(item => item.id)
      return this.params.list.onManager('batchPerformAction', {
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
      return this.params.list.onManager('batchPerformAction', {
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
      return current && current < moment().subtract(1, 'days').endOf('day')
    },
    disabledDateTime (current) {
      const currentHour = moment().hour()
      if (current && current < moment().endOf('day')) {
        return {
          disabledHours: () => this.range(0, currentHour),
          disabledMinutes: () => this.range(0, 60),
          disabledSeconds: () => this.range(0, 60),
        }
      }
    },
    chooseDurationHandle (v) {
      let durationDate = this.expireDate
      switch (v.value) {
        case '1h':
          durationDate = this.expireDate.add(1, 'h')
          break
        case '2h':
          durationDate = this.expireDate.add(2, 'h')
          break
        case '3h':
          durationDate = this.expireDate.add(3, 'h')
          break
        case '6h':
          durationDate = this.expireDate.add(6, 'h')
          break
        case '1d':
          durationDate = this.expireDate.add(1, 'd')
          break
        case '2d':
          durationDate = this.expireDate.add(2, 'd')
          break
        case '1w':
          durationDate = this.expireDate.add(1, 'w')
          break
      }
      this.form.fc.setFieldsValue({ durationDate: durationDate })
    },
  },
}
</script>
