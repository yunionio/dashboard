<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.network')" :count="params.data.length" :action="params.title" />
      <dialog-table class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc">
        <a-form-item
          v-for="(item, i) in ipList"
          :key="item.key"
          :label="i === 0 ? $t('network.text_213') : ''"
          v-bind="i === 0 ? formItemLayout : formItemLayoutWithOutLabel">
          <a-input
            v-decorator="ipDecorator(item, i)"
            :placeholder="$t('network.text_217')"
            style="width: 60%; margin-right: 8px" />
          <a-button
            shape="circle"
            icon="minus"
            size="small"
            v-if="ipList.length > 1"
            @click="decrease(i)"
            class="mt-2 ml-2" />
        </a-form-item>
        <a-form-item v-bind="formItemLayoutWithOutLabel" style="position:relative; top: -14px">
          <div class="d-flex align-items-center" v-if="remain">
            <a-button type="primary" shape="circle" icon="plus" size="small" @click="addIP" />
            <a-button type="link" @click="addIP">{{$t('network.text_640')}}</a-button>
            <span class="count-tips">{{$t('network.text_169')}}<span class="remain-num">{{remain}}</span>{{$t('network.text_170')}}</span>
          </div>
        </a-form-item>
        <a-form-item :label="$t('network.text_641')" v-bind="formItemLayout">
          <a-textarea v-decorator="['notes', {
            rules: [
              { required: true, message: this.$t('network.text_643') },
              { max: 200, message: $t('network.text_642')}
            ],
          }]" :placeholder="$t('network.text_643')" :rows="2" />
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
// import * as R from 'ramda'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { uuid } from '@/utils/utils'
import validateForm from '@/utils/validate'

export default {
  name: 'NetworkReversedIPDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      ipList: [{ key: uuid() }],
      loading: false,
      scope: this.$store.getters.scope,
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: {
          span: 19,
        },
        labelCol: {
          span: 5,
        },
      },
      formItemLayoutWithOutLabel: {
        wrapperCol: {
          span: 19, offset: 5,
        },
      },
    }
  },
  computed: {
    remain () {
      const remain = 5 - this.ipList.length
      return Math.max(remain, 0)
    },
  },
  methods: {
    async ipBlur (rule, value, _callback) {
      const ipData = this.form.fc.getFieldValue('ipData') || {}
      const ips = Object.values(ipData)
      if (ips.filter(ip => ip === value).length >= 2) {
        return _callback(this.$t('network.text_644'))
      }
      const manager = new this.$Manager('reservedips', 'v2')
      try {
        const { data } = await manager.list({
          params: {
            search: value,
            network: this.params.data[0].id,
          },
        })
        if (data && data.length > 0) return _callback(this.$t('network.text_645'))
      } catch {
        _callback()
      }
    },
    ipDecorator (item, i) {
      const { key } = item
      return [`ipData.${key}`, {
        validateFirst: true,
        rules: [
          {
            required: true, message: this.$t('network.text_646'),
          },
          { validator: validateForm('IPv4'), message: this.$t('network.text_647') },
          { validator: this.ipBlur, trigger: ['change'] },
        ],
      }]
    },
    addIP () {
      const key = uuid()
      this.ipList.push({
        key,
      })
    },
    decrease (index) {
      this.ipList.splice(index, 1)
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.params.onManager('performAction', {
          id: this.params.data[0].id,
          managerArgs: {
            action: 'reserve-ip',
            data: {
              ips: Object.values(values.ipData),
              notes: values.notes,
            },
          },
        })
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
