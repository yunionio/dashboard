<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title === 'edit' ? '编辑' : params.title === 'create' ? '新建' : '克隆'}}规则</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item label="类型" v-bind="formItemLayout" v-if="params.title !== 'edit'">
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
          <a-checkbox class="right-checkbox" @change="cidrChange" :checked="isIPChecked">任意IP</a-checkbox>
        </a-form-item>
        <a-form-item label="协议" v-bind="formItemLayout">
          <a-select v-decorator="decorators.protocol" @change="protocolChange">
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
  name: 'EditRulesDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const selectItem = this.params.data[0]
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        type: [
          'type',
        ],
        cidr: [
          'cidr',
          {
            validateFirst: true,
            initialValue: selectItem.cidr || '',
            rules: [
              { required: true, message: '请输入来源' },
              { validator: this.$validate('cidr') },
            ],
          },
        ],
        protocol: [
          'protocol',
          {
            initialValue: selectItem.protocol || 'tcp',
          },
        ],
        ports: [
          'ports',
          {
            validateFirst: true,
            initialValue: JSON.stringify(selectItem) === '{}' ? '' : selectItem.ports ? selectItem.ports : 'ALL',
            rules: [
              { required: true, message: '请输入端口' },
              { validator: this.validatePorts },
            ],
          },
        ],
        action: [
          'action',
          {
            initialValue: selectItem.action || 'allow',
            rules: [
              { required: true },
            ],
          },
        ],
        priority: [
          'priority',
          {
            initialValue: selectItem.priority || 1,
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
      isIPChecked: selectItem.cidr === '0.0.0.0/0',
      IPCheckboxDisabled: selectItem.cidr === '0.0.0.0/0',
      portsDisabled: JSON.stringify(selectItem) === '{}' ? false : !selectItem.ports,
      portsCheckboxDisabled: selectItem.protocol === 'any' || selectItem.protocol === 'icmp',
      portsChecked: JSON.stringify(selectItem) === '{}' ? false : !selectItem.ports,
      decLabel: this.params.type === 'in' ? '来源' : '目标',
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
          callback(new Error(validate(value, 'ports').msg))
        } else {
          callback()
        }
      } else {
        if (value === 'ALL') {
          callback()
        } else {
          if (validate(value, 'ports') === false || validate(value, 'ports').result === false) {
            callback(new Error(validate(value, 'ports').msg))
          } else {
            callback()
          }
        }
      }
    },
    typeChange (e) {
      if (e === 'windows') {
        this.form.fc.setFieldsValue({ ports: '3389' })
      } else if (e === 'linux') {
        this.form.fc.setFieldsValue({ ports: '22' })
      } else if (e === 'http') {
        this.form.fc.setFieldsValue({ ports: '80' })
      } else if (e === 'https') {
        this.form.fc.setFieldsValue({ ports: '443' })
      } else if (e === 'ping') {
        this.portsChecked = true
        this.portsDisabled = true
        this.form.fc.setFieldsValue({ ports: 'ALL' })
        this.portsCheckboxDisabled = true
      } else {
        this.portsChecked = false
        this.portsDisabled = false
        this.form.fc.resetFields(['ports'])
        this.portsCheckboxDisabled = false
      }
    },
    protocolChange (e) {
      if (e === 'icmp') {
        this.portsChecked = true
        this.portsDisabled = true
        this.$nextTick(() => {
          this.form.fc.setFieldsValue({ ports: 'ALL' })
        })
        this.portsCheckboxDisabled = true
      } else {
        if (e === 'any') {
          this.portsChecked = true
          this.$nextTick(() => {
            this.form.fc.setFieldsValue({ ports: 'ALL' })
          })
          this.portsCheckboxDisabled = true
          this.portsDisabled = true
          this.typeDisabled = true
        } else {
          this.portsCheckboxDisabled = false
          this.typeDisabled = false
        }
      }
    },
    cidrChange (e) {
      this.IPCheckboxDisabled = !this.IPCheckboxDisabled
      this.isIPChecked = !this.isIPChecked
      if (e.target.checked) {
        this.$nextTick(() => {
          this.form.fc.setFieldsValue({ cidr: '0.0.0.0/0' })
        })
      } else {
        this.$nextTick(() => {
          this.form.fc.resetFields(['cidr'])
        })
      }
    },
    portsChange (e) {
      this.portsChecked = !this.portsChecked
      this.portsDisabled = !this.portsDisabled
      if (e.target.checked) {
        this.$nextTick(() => {
          this.form.fc.setFieldsValue({ ports: 'ALL' })
        })
      } else {
        this.$nextTick(() => {
          this.form.fc.resetFields(['ports'])
        })
      }
    },
    saveEdit (data) {
      if (this.params.title === 'clone') {
        let description = ''
        this.typeOptions.forEach((item) => {
          if (item.value === data.type) {
            description = item.description
          }
        })
        const params = {
          ...this.params.data[0],
          ...data,
          secgroup: this.params.secgroup,
          description,
        }
        return new this.$Manager('secgrouprules').create({
          data: params,
        })
      } else if (this.params.title === 'create') {
        let description = ''
        this.typeOptions.forEach((item) => {
          if (item.value === data.type) {
            description = item.description
          }
        })
        const params = {
          ...data,
          secgroup: this.params.secgroup,
          description,
          direction: this.params.type,
        }
        return new this.$Manager('secgrouprules').create({
          data: params,
        })
      } else {
        const id = this.params.data[0].id
        return new this.$Manager('secgrouprules').update({
          id,
          data,
        })
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        if (values.ports === 'ALL') {
          values.ports = ''
        }
        await this.saveEdit(values)
        this.loading = false
        this.params.refresh()
        this.cancelDialog()
      } catch (e) {
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
