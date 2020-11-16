<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title === 'edit' ? $t('compute.text_982') : params.title === 'create' ? $t('compute.text_18') : $t('compute.text_983')}}{{$t('compute.rule')}}</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('compute.text_175')" v-bind="formItemLayout" v-if="params.title !== 'edit'">
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
          <a-checkbox class="right-checkbox" @change="cidrChange" :checked="isIPChecked">{{$t('compute.text_997')}}</a-checkbox>
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
              { required: true, message: this.$t('compute.text_996') },
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
              { required: true, message: this.$t('compute.text_347') },
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
        { label: this.$t('compute.text_1009'), value: 'any' },
      ],
      actionOptions: [
        { label: this.$t('compute.text_976'), value: 'allow' },
        { label: this.$t('compute.text_977'), value: 'deny' },
      ],
      typeDisabled: false,
      isIPChecked: selectItem.cidr === '0.0.0.0/0',
      IPCheckboxDisabled: selectItem.cidr === '0.0.0.0/0',
      portsDisabled: JSON.stringify(selectItem) === '{}' ? false : !selectItem.ports,
      portsCheckboxDisabled: selectItem.protocol === 'any' || selectItem.protocol === 'icmp',
      portsChecked: JSON.stringify(selectItem) === '{}' ? false : !selectItem.ports,
      decLabel: this.params.type === 'in' ? this.$t('compute.text_979') : this.$t('compute.text_978'),
      protocolDisabled: this.params.title !== 'edit',
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
        this.form.fc.setFieldsValue({ ports: '3389', protocol: 'tcp' })
        this.portsChecked = false
        this.portsDisabled = true
        this.portsCheckboxDisabled = true
        this.protocolDisabled = true
      } else if (e === 'linux') {
        this.form.fc.setFieldsValue({ ports: '22', protocol: 'tcp' })
        this.portsChecked = false
        this.portsDisabled = true
        this.portsCheckboxDisabled = true
        this.protocolDisabled = true
      } else if (e === 'http') {
        this.form.fc.setFieldsValue({ ports: '80', protocol: 'tcp' })
        this.portsChecked = false
        this.portsDisabled = true
        this.portsCheckboxDisabled = true
        this.protocolDisabled = true
      } else if (e === 'https') {
        this.form.fc.setFieldsValue({ ports: '443', protocol: 'tcp' })
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
          this.form.fc.setFieldsValue({ ports: '' })
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
        this.params.refresh && this.params.refresh()
        this.cancelDialog()
      } catch (e) {
        this.loading = false
        throw e
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
