<template>
  <div>
    <page-header title="修改属性" />
    <a-form class="mt-3" :form="form.fc" @submit.prevent="handleSubmit">
      <a-divider orientation="left">基础配置</a-divider>
      <a-form-item label="名称" v-bind="formItemLayout">
        <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceName')" />
      </a-form-item>
      <a-form-item label="平台" v-bind="formItemLayout">
        <a-radio-group v-decorator="decorators.platform_type">
          <a-radio-button
            v-for="item of platformOpts"
            :key="item.key"
            :disabled="item.key !== 'idc'"
            :value="item.key">{{ item.label }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="服务器类型" v-bind="formItemLayout">
        <a-radio-group v-decorator="decorators.server_type">
          <a-radio-button
            v-for="item of serverTypeOpts"
            :key="item.key"
            :value="item.key">{{ item.label }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="起始IP" v-bind="formItemLayout">
        <a-input v-decorator="decorators.guest_ip_start" />
      </a-form-item>
      <a-form-item label="结束IP" v-bind="formItemLayout">
        <a-input v-decorator="decorators.guest_ip_end" />
      </a-form-item>
      <a-form-item label="子网掩码" v-bind="formItemLayout">
        <a-select v-decorator="decorators.guest_ip_mask">
        <a-select-option v-for="item in netMaskOptions" :key="item.value" :value="item.value">
          {{item.label}}
        </a-select-option>
      </a-select>
      </a-form-item>
      <a-form-item label="默认网关" v-bind="formItemLayout">
        <a-input v-decorator="decorators.guest_gateway" />
      </a-form-item>
      <a-form-item label="VLAN ID" v-bind="formItemLayout">
        <a-input v-decorator="decorators.vlan_id" />
      </a-form-item>
      <a-divider orientation="left">高级配置</a-divider>
      <a-form-item v-bind="formItemLayout">
        <span slot="label">地址分配策略<help-tooltip class="ml-1" name="networkPolicy" /></span>
        <a-radio-group v-decorator="decorators.alloc_policy">
          <a-radio-button
            v-for="item of allocPolicyoptions"
            :key="item.key"
            :value="item.key">{{ item.label }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item label="域名服务器" v-bind="formItemLayout">
        <a-input :placeholder="$t('validator.IPv4')" v-decorator="decorators.guest_dns" />
      </a-form-item>
      <a-form-item v-bind="formItemLayout">
        <span slot="label">主机域名后缀<help-tooltip class="ml-1" name="networkDomain" /></span>
        <a-input :placeholder="$t('validator.domain')" v-decorator="decorators.guest_domain" />
      </a-form-item>
      <page-footer>
        <a-button type="primary" html-type="submit" class="ml-3" :loading="submiting">确定</a-button>
      </page-footer>
    </a-form>
  </div>
</template>

<script>
export default {
  name: 'EditAttributes',
  data () {
    return {
      submiting: false,
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: {
          md: { span: 18 },
          xl: { span: 20 },
          xxl: { span: 22 },
        },
        labelCol: {
          md: { span: 6 },
          xl: { span: 4 },
          xxl: { span: 2 },
        },
      },
      decorators: {
        name: [
          'name',
          {
            initialValue: '',
            validateTrigger: ['change', 'blur'],
            validateFirst: true,
            rules: [
              { required: true, message: '请输入名称' },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        platform_type: [
          'platform_type',
          {
            initialValue: 'idc',
            validateTrigger: ['change', 'blur'],
          },
        ],
        server_type: [
          'server_type',
          {
            initialValue: 'guest',
            validateTrigger: ['change', 'blur'],
            rules: [
              { required: true, message: '请选择服务器类型' },
            ],
          },
        ],
        guest_ip_start: [
          'guest_ip_start',
          {
            validateTrigger: ['change', 'blur'],
            validateFirst: true,
            rules: [
              { required: true, message: '请输入起始IP' },
              { validator: this.$validate('IPv4') },
            ],
          },
        ],
        guest_ip_end: [
          'guest_ip_end',
          {
            validateTrigger: ['change', 'blur'],
            validateFirst: true,
            rules: [
              { required: true, message: '请输入结束IP' },
              { validator: this.$validate('IPv4') },
            ],
          },
        ],
        guest_ip_mask: [
          'guest_ip_mask',
          {
            initialValue: '16',
          },
        ],
        guest_gateway: [
          'guest_gateway',
          {
            validateTrigger: ['change', 'blur'],
            validateFirst: true,
            rules: [
              { required: true, message: '请输入默认网管' },
              { validator: this.$validate('IPv4') },
              { validator: this.validateGateway },
            ],
          },
        ],
        vlan_id: [
          'vlan_id',
        ],
        alloc_policy: [
          'alloc_policy',
          {
            initialValue: 'none',
          },
        ],
        guest_dns: [
          'guest_dns',
          {
            initialValue: '',
            validateTrigger: ['change', 'blur'],
            rules: [
              { validator: this.$validate('IPv4', false) },
            ],
          },
        ],
        guest_domain: [
          'guest_domain',
          {
            initialValue: '',
            validateTrigger: ['change', 'blur'],
            rules: [
              { validator: this.$validate('domain', false) },
            ],
          },
        ],
      },
      params: {
        wire: {
          scope: this.$store.getters.scope,
        },
      },
      platformOpts: [
        { label: '本地IDC', key: 'idc' },
        { label: '私有云', key: 'private' },
        { label: '公有云', key: 'public' },
      ],
      serverTypeOpts: [
        { label: '虚拟机', key: 'guest' },
        { label: '物理机', key: 'baremetal' },
        { label: '容器', key: 'container' },
        { label: 'PXE', key: 'pxe' },
        { label: 'IPMI', key: 'ipmi' },
      ],
      allocPolicyoptions: [
        { label: '缺省策略', key: 'none' },
        { label: '从高地址分配', key: 'stepdown' },
        { label: '从低地址分配', key: 'stepup' },
        { label: '随机分配', key: 'random' },
      ],
      netMaskOptions: [
        { label: '16', value: '16' },
        { label: '17', value: '17' },
        { label: '18', value: '18' },
        { label: '19', value: '19' },
        { label: '20', value: '20' },
        { label: '21', value: '21' },
        { label: '22', value: '22' },
        { label: '23', value: '23' },
        { label: '24', value: '24' },
        { label: '25', value: '25' },
        { label: '26', value: '26' },
        { label: '27', value: '27' },
        { label: '28', value: '28' },
        { label: '29', value: '29' },
        { label: '30', value: '30' },
      ],
      wire_id: '',
    }
  },
  provide () {
    return {
      form: this.form,
    }
  },
  mounted () {
    this.bindData()
  },
  methods: {
    fetchData () {
      return new this.$Manager('networks').get({ id: this.$route.query.network_id })
    },
    async bindData () {
      const { data } = await this.fetchData()
      this.form.fc.setFieldsValue({
        name: data.ifname_hint,
        server_type: data.server_type,
        guest_ip_start: data.guest_ip_start,
        guest_ip_end: data.guest_ip_end,
        guest_ip_mask: data.guest_ip_mask,
        guest_gateway: data.guest_gateway,
        vlan_id: data.vlan_id || '',
        alloc_policy: data.alloc_policy,
        guest_dns: data.guest_dns || '',
        guest_domain: data.guest_domain || '',
      })
      this.wire_id = data.wire_id
    },
    validateGateway (rule, value, callback) {
      // 只需要查看是否是以 0 结尾
      const ipItems = value.split('.')
      if (ipItems[ipItems.length - 1] === '0') {
        callback(new Error('网关不能以0结尾'))
      } else {
        callback()
      }
    },
    doUpdate (data) {
      return new this.$Manager('networks').update({
        id: this.$route.query.network_id,
        data,
      })
    },
    async handleSubmit () {
      this.submiting = true
      try {
        let values = await this.form.fc.validateFields()
        values = {
          ...values,
          wire_id: this.wire_id,
        }
        await this.doUpdate(values)
        this.$router.push({ name: 'Network' })
      } finally {
        this.submiting = false
      }
    },
  },
}
</script>
