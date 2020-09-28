<template>
  <div>
    <page-header :title="$t('network.text_606')" />
    <a-form class="mt-3" :form="form.fc" @submit.prevent="handleSubmit">
      <a-divider orientation="left">{{$t('network.text_397')}}</a-divider>
      <a-form-item :label="$t('network.text_21')" v-bind="formItemLayout">
        <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceName')" />
      </a-form-item>
      <a-form-item :label="$t('network.text_198')" v-bind="formItemLayout">
        <a-radio-group v-decorator="decorators.platform_type">
          <a-radio-button
            v-for="item of platformOpts"
            :key="item.key"
            :disabled="item.key !== 'idc'"
            :value="item.key">{{ item.label }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item :label="$t('network.text_574')" v-bind="formItemLayout">
        <a-radio-group v-decorator="decorators.server_type">
          <a-radio-button
            v-for="item of serverTypeOpts"
            :key="item.key"
            :value="item.key">{{ item.label }}</a-radio-button>
        </a-radio-group>
      </a-form-item>
      <a-form-item :label="$t('network.text_607')" v-bind="formItemLayout">
        <a-input v-decorator="decorators.guest_ip_start" />
      </a-form-item>
      <a-form-item :label="$t('network.text_608')" v-bind="formItemLayout">
        <a-input v-decorator="decorators.guest_ip_end" />
      </a-form-item>
      <a-form-item :label="$t('network.text_609')" v-bind="formItemLayout">
        <a-select v-decorator="decorators.guest_ip_mask">
        <a-select-option v-for="item in netMaskOptions" :key="item.value" :value="item.value">
          {{item.label}}
        </a-select-option>
      </a-select>
      </a-form-item>
      <a-form-item :label="$t('network.text_610')" v-bind="formItemLayout">
        <a-input v-decorator="decorators.guest_gateway" />
      </a-form-item>
      <a-form-item label="VLAN ID" v-bind="formItemLayout">
        <a-input v-decorator="decorators.vlan_id" />
      </a-form-item>
      <a-collapse :bordered="false">
        <a-collapse-panel :header="$t('network.text_94')" key="1" forceRender>
          <a-form-item v-bind="formItemLayout">
            <span slot="label">{{$t('network.text_583')}}<help-tooltip class="ml-1" name="networkPolicy" /></span>
            <a-radio-group v-decorator="decorators.alloc_policy">
              <a-radio-button
                v-for="item of allocPolicyoptions"
                :key="item.key"
                :value="item.key">{{ item.label }}</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item :label="$t('network.text_585')" v-bind="formItemLayout">
            <a-input :placeholder="$t('validator.IPv4')" v-decorator="decorators.guest_dns" />
          </a-form-item>
          <a-form-item v-bind="formItemLayout">
            <span slot="label">{{$t('network.text_586')}}<help-tooltip class="ml-1" name="networkDomain" /></span>
            <a-input :placeholder="$t('validator.domain')" v-decorator="decorators.guest_domain" />
          </a-form-item>
        </a-collapse-panel>
      </a-collapse>
      <page-footer>
        <template v-slot:right>
          <a-button type="primary" html-type="submit" class="ml-3" :loading="submiting" size="large">{{$t('network.text_30')}}</a-button>
          <a-button class="ml-3" size="large" @click="() => $router.back()">{{$t('common.cancel')}}</a-button>
        </template>
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
              { required: true, message: this.$t('network.text_116') },
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
              { required: true, message: this.$t('network.text_592') },
            ],
          },
        ],
        guest_ip_start: [
          'guest_ip_start',
          {
            validateTrigger: ['change', 'blur'],
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('network.text_593') },
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
              { required: true, message: this.$t('network.text_594') },
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
              // { required: true, message: this.$t('network.text_611') },
              { validator: this.$validate('IPv4', false) },
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
        { label: this.$t('network.text_207'), key: 'idc' },
        { label: this.$t('network.text_208'), key: 'private' },
        { label: this.$t('network.text_209'), key: 'public' },
      ],
      serverTypeOpts: [
        { label: this.$t('network.text_226'), key: 'guest' },
        { label: this.$t('network.text_598'), key: 'baremetal' },
        { label: this.$t('network.text_599'), key: 'container' },
        { label: 'PXE', key: 'pxe' },
        { label: 'IPMI', key: 'ipmi' },
        { label: this.$t('network.text_221'), key: 'eip' },
      ],
      allocPolicyoptions: [
        { label: this.$t('network.text_600'), key: 'none' },
        { label: this.$t('network.text_601'), key: 'stepdown' },
        { label: this.$t('network.text_602'), key: 'stepup' },
        { label: this.$t('network.text_603'), key: 'random' },
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
      cloudEnv: '',
      vpcId: '',
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
        name: data.name,
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
      this.cloudEnv = data.cloud_env
      this.vpcId = data.vpc_id
    },
    validateGateway (rule, value, callback) {
      if (!value) {
        return callback()
      }
      // 只需要查看是否是以 0 结尾
      const ipItems = value.split('.')
      if (ipItems[ipItems.length - 1] === '0') {
        callback(new Error(this.$t('network.text_591')))
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
        const networkPath = this.$router.resolve(this.$route.path)
        this.$router.push({ path: networkPath.resolved.matched[0].path })
      } catch (err) {
        throw err
      } finally {
        this.submiting = false
      }
    },
  },
}
</script>
