<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="params.title" name="IP子网" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc">
        <a-form-item
          v-for="(item, i) in ipList"
          :key="item.key"
          :label="i === 0 ? 'IP地址' : ''"
          v-bind="i === 0 ? formItemLayout : formItemLayoutWithOutLabel">
          <a-input
            v-decorator="ipDecorator(item, i)"
            placeholder="请输入IP地址"
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
            <a-button type="link" @click="addIP">添加新IP地址</a-button>
            <span class="count-tips">
              您还可以添加
              <span class="remain-num">{{remain}}</span> 个
            </span>
          </div>
        </a-form-item>
        <a-form-item label="预留原因" v-bind="formItemLayout">
          <a-textarea v-decorator="['notes', {
            rules: [{ max: 200, message: '输入的字符长度不能大于200'}],
          }]" placeholder="请填写预留原因" :rows="4" />
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
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      formItemLayoutWithOutLabel: {
        wrapperCol: {
          span: 20, offset: 4,
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
        return _callback('请勿重复添加相同IP')
      }
      const manager = new this.$Manager('reservedips', 'v2')
      const { data } = await manager.list({
        search: value,
        network: this.params.data[0].id,
      })
      if (data && data.length > 0) {
        return _callback('该IP已被预留,请勿重复添加')
      }
      _callback()
    },
    ipDecorator (item, i) {
      const { key } = item
      return [`ipData.${key}`, {
        validateFirst: true,
        // trigger: ['blur'],
        rules: [
          {
            required: true, message: '请填写IP地址',
          },
          { validator: validateForm('IPv4'), message: '请输入合法IP' },
          { validator: this.ipBlur, trigger: ['blur'] },
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
        await this.params.list.onManager('performAction', {
          id: this.params.data[0].id,
          steadyStatus: this.params.list.steadyStatus,
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
