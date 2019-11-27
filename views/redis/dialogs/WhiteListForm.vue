<template>
    <base-dialog @cancel="cancelDialog">
        <div slot="header">{{params.title}}</div>
        <a-form slot="body" :form="form.fc" class="mt-3">
           <template v-if="params.data && params.data.length > 0">
              <dialog-selected-tips :count="params.data.length" :action="params.title" />
              <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
           </template>
            <a-form-item v-bind="formItemLayout" label="分组名">
                <a-input placeholder="请选择分组名称" v-decorator="decorators.name" />
            </a-form-item>
            <a-form-item v-bind="formItemLayout" label="IP地址/地段名">
                <a-textarea placeholder="例：10.10.10.1 或者 10.10.0.0/10"
                 :autosize="{ minRows: 4, maxRows: 7 }"
                 v-decorator="decorators['ip_list']" />
                 <div style="line-height:20px;color:#999">有多个IP地址/地址段，请用“，”进行分割。每个实例最多添加20个IP地址/地址段，请用“，”进行分割。每个实例最多添加20个IP地址
                     ，您还可以添加<b style="color:#666">{{20-this.ipsLength}}</b>个IP地址/地址段
                 </div>
            </a-form-item>
        </a-form>
         <div slot="footer">
            <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
            <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
         </div>
    </base-dialog>
</template>

<script>
import validateForm, { REGEXP } from '@/utils/validate'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'RedisWhiteListFormDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      title: '新建',
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: { span: 20 },
        labelCol: { span: 4 },
      },
      ipsLength: 0,
    }
  },
  computed: {
    decorators () {
      const { initialValues = {} } = this.params
      const decorators = {
        name: [
          'name',
          {
            initialValue: initialValues.name,
            validateFirst: true,
            rules: [
              { required: true, message: '请输入名称' },
              { validator: validateForm('serverName') },
            ],
          },
        ],
        ip_list: [
          'ip_list',
          {
            initialValue: initialValues.ip_list,
            validateFirst: true,
            validateTrigger: 'blur',
            rules: [
              { required: true, message: '请添加IP地址/地段名' },
              { validator: this.validateIps },
            ],
          },
        ],
      }
      return decorators
    },
  },
  created () {
    const { initialValues = {} } = this.params
    if (initialValues.ip_list) {
      this.ipsLength = initialValues.ip_list.split(',').length
    }
  },
  methods: {
    validateIps (rule, value, _callback) {
      const REG_IP = REGEXP.IPv4.regexp
      const REG_NUM = /\d/
      if (value) {
        const ips = value.split(',')
        const ipsLength = ips.length
        for (let i = 0; i < ipsLength; i++) {
          const _item = ips[i]
          const [_ip, _u] = _item.split('/')
          if (_ip && !REG_IP.test(_ip)) {
            _callback(`${_item}格式不对`)
          }
          if (_u && !REG_NUM.test(_u)) {
            _callback(`地址段${_u}只能是数字`)
          }
        }
        this.ipsLength = ipsLength
      }
      _callback()
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
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        if (this.params.data && this.params.data.length > 0) {
          const params = {
            ...values,
            elasticcache: this.params.redisItem.id,
          }
          if (params.name === this.params.data[0].name) {
            delete params.name
          }
          await this.params.list.onManager('update', {
            id: this.params.data[0].id,
            managerArgs: {
              data: params,
            },
          })
        } else {
          await this.params.list.onManager('create', {
            managerArgs: {
              data: {
                ...values,
                elasticcache: this.params.redisItem.id,
              },
            },
          })
        }
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
