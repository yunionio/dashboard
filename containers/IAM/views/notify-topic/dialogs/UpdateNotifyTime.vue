<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('iam.modify_notify_time') }}</div>
    <div slot="body">
      <!-- <a-alert class="mb-2" :message="$t('bill.rateset_create_tip')" /> -->
      <dialog-selected-tips :count="params.data.length" :name="$t('iam.message_subscription')" :action="$t('iam.modify_notify_time')" />
      <dialog-table v-if="params.columns && params.columns.length" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form-model
        ref="form"
        v-bind="formItemLayout"
        :model="form"
        :rules="rules">
        <a-form-model-item prop="advance_days" class="mb-3">
          <div class="d-flex align-items-cneter" v-for="(item,index) in form.advance_days" :key="index">
            <span class="mr-5">{{$t('iam.notify_time') + (index + 1)}}:</span>
            <span>{{$t('iam.before_expiration')}}<a-input-number v-model="form.advance_days[index]" class="ml-2 mr-2" :min="1" :step="1" :precision="0" @change="validateForm" />{{$t('iam.day')}}</span>
            <a-button v-if="form.advance_days.length > 1" style="margin-left:10px;transform:translateY(8px)" shape="circle" icon="minus" size="small" @click="deleteDay(index)" />
          </div>
        </a-form-model-item>
        <a-button type="link" @click="addDay"><a-icon type="plus" style="padding: 0" /> {{$t('iam.add_notify_time')}}</a-button>
      </a-form-model>
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
import { validateModelForm } from '@/utils/validate'

export default {
  name: 'NotifyTopicUpdateTimeDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const { advance_days = [1] } = this.params.data[0]
    return {
      loading: false,
      form: {
        advance_days,
      },
      rules: {
        advance_days: { required: true, validator: this.validatorDays },
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
    }
  },
  created () {
  },
  methods: {
    validatorDays (rule, value, callback) {
      const left = Array.from(new Set(value))
      if (left.length !== value.length) {
        callback(new Error(this.$t('iam.notify_time_not_repeat')))
      }
      callback()
    },
    addDay () {
      this.form.advance_days.push(this.form.advance_days[this.form.advance_days.length - 1] + 1)
    },
    deleteDay (idx) {
      this.form.advance_days = this.form.advance_days.filter((item, index) => index !== idx)
    },
    async doUpdate () {
      return this.params.onManager('update', {
        id: this.params.data[0].id,
        managerArgs: {
          data: this.form,
        },
      })
    },
    validateForm () {
      validateModelForm(this.$refs.form)
    },
    async handleConfirm () {
      this.loading = true
      try {
        await validateModelForm(this.$refs.form)
        this.loading = true
        await this.doUpdate()
        this.loading = false
        // this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
