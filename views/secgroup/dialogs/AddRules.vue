<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">批量追加规则</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item label="方向" v-bind="formItemLayout">
          <a-radio-group v-decorator="decorators.direction" @change="decoratorsChange">
            <a-radio value="in">
              入方向
            </a-radio>
            <a-radio value="out">
              出方向
            </a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="类型" v-bind="formItemLayout">
          <a-select
            v-decorator="decorators.type"
            :disabled="typeDisabled"
            placeholder="请选择"
            @change="typeChange">
            <a-select-option v-for="item in typeOptions" :key="item.value" :value="item.value">
              {{item.label}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-bind="formItemLayout">
          <span slot="label">
            {{decLabel}}&nbsp;
            <a-tooltip title="来源支持以下格式:单个IP: 192.168.0.1CIDR: 192.168.1.0/24">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-input :disabled="IPCheckboxDisabled" v-decorator="decorators.cidr" placeholder="请输入来源" />
          <a-checkbox class="right-checkbox" @change="cidrChange">任意IP</a-checkbox>
        </a-form-item>
        <a-form-item label="协议" v-bind="formItemLayout">
          <a-select v-decorator="decorators.protocol" @change="protocolChange" :disabled="protocolDisabled">
            <a-select-option v-for="item in protocolOptions" :key="item.value" :value="item.value">
              {{item.label}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-bind="formItemLayout">
          <span slot="label">
            端口&nbsp;
            <a-tooltip title="协议端口支持以下格式: 单个端口: 80 多个端口: 80,443 连续端口: 3306-20000">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-input :disabled="portsDisabled" v-decorator="decorators.ports" placeholder="请输入端口号" />
          <a-checkbox class="right-checkbox" @change="portsChange" :checked="portsChecked" :disabled="portsCheckboxDisabled">任意端口</a-checkbox>
        </a-form-item>
        <a-form-item label="策略" v-bind="formItemLayout">
          <a-select v-decorator="decorators.action">
            <a-select-option v-for="item in actionOptions" :key="item.value" :value="item.value">
              {{item.label}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-bind="formItemLayout">
          <span slot="label">
            优先级&nbsp;
            <a-tooltip title="从1到100优先级依次增大">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-input-number :min="1" :max="100" v-decorator="decorators.priority" />
        </a-form-item>
      </a-form>
      <dialog-selected-tips :name="$t('dictionary.secgroup')" :count="params.data.length" action="批量追加规则" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { validate } from '@/utils/validate'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'AddRulesDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        direction: [
          'direction',
          {
            initialValue: 'in',
          },
        ],
        type: [
          'type',
        ],
        cidr: [
          'cidr',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请输入来源' },
              { validator: this.$validate('cidr') },
            ],
          },
        ],
        protocol: [
          'protocol',
          {
            initialValue: 'tcp',
          },
        ],
        ports: [
          'ports',
          {
            rules: [
              { required: true, message: '请输入端口' },
              { validator: this.validatePorts },
            ],
          },
        ],
        action: [
          'action',
          {
            initialValue: 'allow',
            rules: [
              { required: true },
            ],
          },
        ],
        priority: [
          'priority',
          {
            initialValue: 1,
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 8,
        },
        labelCol: {
          span: 3,
        },
      },
      typeOptions: [
        { label: '自定义', value: 'custom', description: '' },
        { label: '微软远程桌面 (3389)', value: 'windows', description: 'Windows远程登录' },
        { label: 'SSH (22)', value: 'linux', description: 'Linux SSH登录' },
        { label: 'HTTP（80）', value: 'http', description: 'Web服务端口（http）' },
        { label: 'HTTPS（443）', value: 'https', description: 'Web服务端口（https）' },
        { label: 'Ping', value: 'ping', description: 'Ping服务' },
      ],
      protocolOptions: [
        { label: 'TCP', value: 'tcp' },
        { label: 'UDP', value: 'udp' },
        { label: 'ICMP', value: 'icmp' },
        { label: '任意协议', value: 'any' },
      ],
      actionOptions: [
        { label: '允许', value: 'allow' },
        { label: '拒绝', value: 'deny' },
      ],
      typeDisabled: false,
      IPCheckboxDisabled: false,
      portsDisabled: false,
      portsCheckboxDisabled: false,
      portsChecked: false,
      protocolDisabled: this.params.title !== 'edit',
      decLabel: '来源',
    }
  },
  methods: {
    validatePorts (rule, value, callback) {
      const ports = value.indexOf(',') !== -1 ? value.split(',') : value.split('-')
      if (ports.length > 1) {
        const pass = ports.every(function (item, index) {
          return +item && item >= 0 && item <= 65535
        })
        if (!pass) {
          if (validate(value, 'ports') === false || validate(value, 'ports').result === false) {
            callback(new Error(validate(value, 'ports').msg))
          }
          callback()
        } else {
          callback()
        }
      } else {
        if (value === 'ALL') {
          callback()
        } else {
          if (validate(value, 'ports') === false || validate(value, 'ports').result === false) {
            callback(new Error(validate(value, 'ports').msg))
          }
          callback()
        }
      }
    },
    typeChange (e) {
      if (e === 'windows') {
        this.form.fc.setFieldsValue({ ports: '3389' })
        this.portsChecked = false
        this.portsDisabled = true
        this.portsCheckboxDisabled = true
        this.protocolDisabled = true
      } else if (e === 'linux') {
        this.form.fc.setFieldsValue({ ports: '22' })
        this.portsChecked = false
        this.portsDisabled = true
        this.portsCheckboxDisabled = true
        this.protocolDisabled = true
      } else if (e === 'http') {
        this.form.fc.setFieldsValue({ ports: '80' })
        this.portsChecked = false
        this.portsDisabled = true
        this.portsCheckboxDisabled = true
        this.protocolDisabled = true
      } else if (e === 'https') {
        this.form.fc.setFieldsValue({ ports: '443' })
        this.portsChecked = false
        this.portsDisabled = true
        this.portsCheckboxDisabled = true
        this.protocolDisabled = true
      } else if (e === 'ping') {
        this.form.fc.setFieldsValue({ ports: 'ALL', protocol: 'icmp' })
        this.portsChecked = true
        this.portsDisabled = true
        this.portsCheckboxDisabled = true
        this.protocolDisabled = true
      } else {
        this.portsChecked = false
        this.portsDisabled = false
        this.form.fc.resetFields(['ports'])
        this.portsCheckboxDisabled = false
        this.protocolDisabled = false
      }
    },
    protocolChange (e) {
      if (e === 'icmp') {
        this.portsChecked = true
        this.portsDisabled = true
        this.form.fc.setFieldsValue({ ports: 'ALL' })
        this.portsCheckboxDisabled = true
      } else {
        this.portsCheckboxDisabled = false
      }
      if (e === 'any') {
        this.portsChecked = true
        this.form.fc.setFieldsValue({ ports: 'ALL' })
        this.form.fc.setFieldsValue({ type: 'custom' })
        this.portsCheckboxDisabled = true
        this.portsDisabled = true
        this.typeDisabled = true
      } else {
        this.portsCheckboxDisabled = false
        this.typeDisabled = false
      }
    },
    decoratorsChange (e) {
      if (e.target.value === 'out') {
        this.decLabel = '目标'
      } else {
        this.decLabel = '来源'
      }
      this.form.fc.resetFields()
    },
    cidrChange (e) {
      this.IPCheckboxDisabled = !this.IPCheckboxDisabled
      if (e.target.checked) {
        this.form.fc.setFieldsValue({ cidr: '0.0.0.0/0' })
      } else {
        this.form.fc.resetFields(['cidr'])
      }
    },
    portsChange (e) {
      this.portsChecked = !this.portsChecked
      this.portsDisabled = !this.portsDisabled
      if (e.target.checked) {
        this.form.fc.setFieldsValue({ ports: 'ALL' })
      } else {
        this.form.fc.resetFields(['ports'])
      }
    },
    doAdd (data) {
      const ids = this.params.data.map(v => v.id)
      return new this.$Manager('secgroups').batchPerformAction({
        action: 'add-rule',
        ids,
        data,
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        if (values.ports === 'ALL') {
          values.ports = ''
        }
        let description = ''
        this.typeOptions.forEach((item) => {
          if (item.value === values.type) {
            description = item.description
          }
        })
        values.description = description
        await this.doAdd(values)
        this.loading = false
        this.params.refresh()
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.right-checkbox {
  width: 100px;
  height: 40px;
  left: 270px;
  font-size: 12px!important;
  color: #ccc;
  position: absolute;
}
</style>
