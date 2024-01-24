<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_991')}}</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('compute.text_990')" v-bind="formItemLayout">
          <a-radio-group v-decorator="decorators.direction" @change="decoratorsChange">
            <a-radio value="in">{{$t('compute.text_993')}}</a-radio>
            <a-radio value="out">{{$t('compute.text_994')}}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('compute.text_175')" v-bind="formItemLayout">
          <a-select
            v-decorator="decorators.type"
            :disabled="typeDisabled"
            :placeholder="$t('compute.text_219')"
            @change="typeChange">
            <a-select-option v-for="item in typeOptions" :key="item.value" :value="item.value">
              {{item.label}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-bind="formItemLayout">
          <span slot="label">
            {{decLabel}}&nbsp;
            <a-tooltip :title="$t('compute.text_995')">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-input :disabled="IPCheckboxDisabled" v-decorator="decorators.cidr" :placeholder="$t('compute.text_996')" />
          <a-checkbox class="right-checkbox" @change="cidrChange">{{$t('compute.text_997')}}</a-checkbox>
        </a-form-item>
        <a-form-item :label="$t('compute.text_980')" v-bind="formItemLayout">
          <a-select v-decorator="decorators.protocol" @change="protocolChange" :disabled="protocolDisabled">
            <a-select-option v-for="item in protocolOptions" :key="item.value" :value="item.value">
              {{item.label}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-bind="formItemLayout">
          <span slot="label">{{$t('compute.text_998')}}<a-tooltip :title="$t('compute.text_999')">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-input :disabled="portsDisabled" v-decorator="decorators.ports" :placeholder="$t('compute.text_350')" />
          <a-checkbox class="right-checkbox" @change="portsChange" :checked="portsChecked" :disabled="portsCheckboxDisabled">{{$t('compute.text_1000')}}</a-checkbox>
        </a-form-item>
        <a-form-item :label="$t('compute.text_694')" v-bind="formItemLayout">
          <a-select v-decorator="decorators.action">
            <a-select-option v-for="item in actionOptions" :key="item.value" :value="item.value">
              {{item.label}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-bind="formItemLayout">
          <span slot="label">{{$t('compute.text_1001')}}<a-tooltip :title="$t('compute.text_1002')">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-input-number :min="1" :max="100" v-decorator="decorators.priority" />
        </a-form-item>
      </a-form>
      <dialog-selected-tips :name="$t('dictionary.secgroup')" :count="params.data.length" :action="$t('compute.text_991')" />
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
              { required: true, message: this.$t('compute.text_996') },
              { validator: this.$validate(['cidr', 'IPv4', 'cidr6', 'IPv6'], true, 'some') },
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
              { required: true, message: this.$t('compute.text_347') },
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
        { label: this.$t('compute.text_144'), value: 'custom', description: '' },
        { label: this.$t('compute.text_1003'), value: 'windows', description: this.$t('compute.text_1004') },
        { label: 'SSH (22)', value: 'linux', description: this.$t('compute.text_1005') },
        { label: 'HTTP（80）', value: 'http', description: this.$t('compute.text_1006') },
        { label: 'HTTPS（443）', value: 'https', description: this.$t('compute.text_1007') },
        { label: 'Ping', value: 'ping', description: this.$t('compute.text_1008') },
      ],
      protocolOptions: [
        { label: 'TCP', value: 'tcp' },
        { label: 'UDP', value: 'udp' },
        { label: 'ICMP', value: 'icmp' },
        { label: this.$t('compute.any_protocol.text'), value: 'any' },
      ],
      actionOptions: [
        { label: this.$t('compute.text_976'), value: 'allow' },
        { label: this.$t('compute.text_977'), value: 'deny' },
      ],
      typeDisabled: false,
      IPCheckboxDisabled: false,
      portsDisabled: false,
      portsCheckboxDisabled: false,
      portsChecked: false,
      protocolDisabled: this.params.title !== 'edit',
      decLabel: this.$t('compute.text_979'),
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
        this.decLabel = this.$t('compute.text_978')
      } else {
        this.decLabel = this.$t('compute.text_979')
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

<style lang="less" scoped>
.right-checkbox {
  width: 100px;
  height: 40px;
  left: 270px;
  font-size: 12px!important;
  color: #ccc;
  position: absolute;
}
</style>
