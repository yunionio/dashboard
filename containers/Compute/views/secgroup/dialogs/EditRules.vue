<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title === 'edit' ? $t('compute.text_982') : params.title === 'create' ? $t('compute.perform_create') : $t('compute.text_983')}}{{$t('compute.rule')}}</div>
    <div slot="body">
      <a-form
        v-bind="formItemLayout"
        :form="form.fc">
        <a-form-item :label="$t('compute.text_175')" v-if="params.title !== 'edit'">
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
        <a-form-item :extra="$t('compute.secgroup.source.effect.desc')">
          <span slot="label">
            {{decLabel}}&nbsp;
            <a-tooltip :title="$t('compute.text_995')">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-select
            mode="combobox"
            @change="fetchSecgroups"
            option-filter-prop="children"
            :placeholder="$t('compute.secgroup.source.placeholder')"
            v-decorator="decorators.source">
            <a-select-opt-group>
              <span slot="label">CIDR</span>
              <a-select-option v-for="item in cidrOptions" :key="item.value" :value="item.value">
              {{item.value}}
              </a-select-option>
            </a-select-opt-group>
            <a-select-opt-group>
              <span slot="label">{{$t('dictionary.secgroup')}}</span>
              <a-select-option v-for="item in secgroupOpts" :key="item.id" :value="item.name">
              {{item.name}}
              </a-select-option>
            </a-select-opt-group>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('compute.text_980')">
          <a-select v-decorator="decorators.protocol" @change="protocolChange" :disabled="protocolDisabled">
            <a-select-option v-for="item in protocolOptions" :key="item.value" :value="item.value">
              {{item.label}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <span slot="label">{{$t('compute.text_998')}}<a-tooltip :title="$t('compute.text_999')">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-input :disabled="portsDisabled" v-decorator="decorators.ports" :placeholder="$t('compute.text_350')" />
          <a-checkbox class="right-checkbox" @change="portsChange" :checked="portsChecked" :disabled="portsCheckboxDisabled">{{$t('compute.text_1000')}}</a-checkbox>
        </a-form-item>
        <a-form-item :label="$t('compute.text_694')">
          <a-select v-decorator="decorators.action">
            <a-select-option v-for="item in actionOptions" :key="item.value" :value="item.value">
              {{item.label}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <span slot="label">{{$t('compute.text_1001')}}<a-tooltip :title="$t('compute.text_1002')">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-input-number :min="1" :max="100" v-decorator="decorators.priority" />
        </a-form-item>
        <a-form-item>
          <span slot="label">{{$t('compute.text_312')}}</span>
          <a-input v-decorator="decorators.description" :placeholder="$t('common_367')" />
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
import { mapGetters } from 'vuex'
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
        source: [
          'source',
          {
            validateFirst: true,
            initialValue: selectItem.cidr || selectItem.peer_secgroup || '',
            rules: [
              { required: true, message: this.$t('compute.text_996') },
              // { validator: this.$validate('cidr') },
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
        description: [
          'description',
          {
            initialValue: selectItem.description || '',
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 10,
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
      cidrOptions: [
        { value: '0.0.0.0/0' },
        { value: '10.0.0.0/8' },
        { value: '172.16.0.0/12' },
        { value: '192.168.0.0/16' },
      ],
      secgroupOpts: [
      ],
      typeDisabled: false,
      portsDisabled: JSON.stringify(selectItem) === '{}' ? false : !selectItem.ports,
      portsCheckboxDisabled: selectItem.protocol === 'any' || selectItem.protocol === 'icmp',
      portsChecked: JSON.stringify(selectItem) === '{}' ? false : !selectItem.ports,
      decLabel: this.params.type === 'in' ? this.$t('compute.text_979') : this.$t('compute.text_978'),
      protocolDisabled: this.params.title !== 'edit',
    }
  },
  computed: {
    ...mapGetters(['scope']),
  },
  created () {
    this.fetchSecgroups('')
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
    async fetchSecgroups (value) {
      const params = {
        filter: [
          `id.notequals("${this.params.secgroup}")`,
        ],
        scope: this.scope,
        limit: 10,
      }
      if (value.length > 0) {
        params.filter.push(`name.contains("${value}")`)
      }
      await new this.$Manager('secgroups').list({ params })
        .then(({ data: { data = [] } }) => {
          this.secgroupOpts.splice(0, this.secgroupOpts.length, ...data)
        })
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
          description: data.description && data.description.length > 0 ? data.description : description,
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
          description: data.description && data.description.length > 0 ? data.description : description,
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
        if (values.source) {
          const isCidr = validate(values.source, 'cidr')
          if (!isCidr || isCidr.result === false) {
            values.peer_secgroup_id = values.source
          } else {
            values.cidr = values.source
          }
          delete values.source
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
  left: 330px;
  font-size: 12px!important;
  color: #ccc;
  position: absolute;
}
</style>
