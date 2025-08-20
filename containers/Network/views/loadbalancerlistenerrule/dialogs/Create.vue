<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('network.text_521')}}</div>
    <div slot="body">
      <a-form
        v-bind="formItemLayout"
        :form="form.fc">
        <a-form-item :label="$t('network.text_21')">
          <a-input v-decorator="decorators.name"  :placeholder="$t('network.text_522')" />
        </a-form-item>
        <template v-if="isCloudflare">
          <a-form-model-item :label="$t('network.text_156')" class="mb-0" required>
            <div class="d-flex align-items-top">
              <a-form-item class="mr-2" style="width: 100%" :extra="$t('network.domain_prefix_extra')">
                <a-input v-decorator="decorators.domain_prefix" :placeholder="$t('network.domain_prefix')" />
              </a-form-item>
              <a-form-item style="width: 100%">
                <base-select
                  v-decorator="decorators.domain_name"
                  resource="cdn_domains"
                  :params="cdnDomainParams"
                  filterable
                  :mapper="domainMapper"
                  :select-props="{ placeholder: $t('network.text_156') }" />
              </a-form-item>
            </div>
          </a-form-model-item>
          <a-form-item label="URL" :extra="$t('network.domain_url_extra')">
            {{ currentUrl }}
          </a-form-item>
          <a-form-item :label="$t('network.text_139')">
            <base-select
              v-decorator="decorators.backend_groups"
              resource="loadbalancerbackendgroups"
              :params="backendParams"
              filterable
              :select-props="{ placeholder: $t('network.text_139'), mode: 'multiple' }" />
          </a-form-item>
          <a-form-item :label="$t('network.default_backend_server_group')" :extra="$t('network.default_backend_server_group_extra')">
            <base-select
              v-decorator="decorators.backend_group_id"
              resource="loadbalancerbackendgroups"
              :params="backendParams1"
              filterable
              :select-props="{ placeholder: $t('network.default_backend_server_group') }" />
          </a-form-item>
          <a-form-item :label="$t('network.rule_redirect')" :extra="form.fd.redirect_type === 'geography' ? $t('network.rule_redirect_extra') : ''">
            <a-select v-decorator="decorators.redirect_type">
              <a-select-option value="off">{{$t('network.rule_redirect_type_off')}}</a-select-option>
              <a-select-option value="geography">{{$t('network.rule_redirect_type_geography')}}</a-select-option>
            </a-select>
          </a-form-item>
          <template v-if="form.fd.redirect_type === 'geography'">
            <a-form-model-item v-bind="formItemLayout2" :label="$t('network.rule_redirect_region_country')">
              <div class="d-flex" v-for="(item, index) in redirectRules" :key="index">
                <a-form-item class="mr-2 w-100">
                  <a-select class="w-100" v-decorator="decorators.redirect_region_type(index)" :placeholder="$t('network.rule_redirect_type')">
                    <a-select-option value="region">{{$t('network.text_199')}}</a-select-option>
                    <a-select-option value="country">{{$t('network.cdn.clear_cache_country')}}</a-select-option>
                  </a-select>
                </a-form-item>
                <a-form-item class="mr-2 w-100">
                  <a-select v-if="item.type === 'region'" class="w-100" v-decorator="decorators.redirect_region_country(index)" :placeholder="item.type === 'region' ? $t('network.text_199') : $t('network.cdn.clear_cache_country')">
                    <a-select-option v-for="region in REGIONS" :key="region.key" :value="region.key">{{region.label}}</a-select-option>
                  </a-select>
                  <a-select v-else-if="item.type === 'country'" class="w-100" v-decorator="decorators.redirect_region_country(index)" :placeholder="item.type === 'region' ? $t('network.text_199') : $t('network.cdn.clear_cache_country')">
                    <a-select-option v-for="country in COUNTRYS" :key="country.key" :value="country.key">{{country.label}}</a-select-option>
                  </a-select>
                  <a-select v-else class="w-100" />
                </a-form-item>
                <a-form-item class="mr-2 w-100">
                  <base-select
                    class="w-100"
                    v-decorator="decorators.redirect_backend_groups(index)"
                    resource="loadbalancerbackendgroups"
                    :params="genBackendParams(index)"
                    filterable
                    :select-props="{placeholder: $t('network.text_139'), mode: 'multiple' }" />
                </a-form-item>
                <a-form-item>
                  <div><a-button style="flex: 0 0 24px;" shape="circle" icon="minus" size="small" :disabled="redirectRules.length === 1" @click="deleteRule(item,index)" /></div>
                </a-form-item>
              </div>
            </a-form-model-item>
            <div class="d-flex align-items-center">
              <a-button type="primary" shape="circle" icon="plus" size="small" @click="addRule" />
              <a-button type="link" @click="addRule">{{$t('network.add_redirect_rule')}}</a-button>
            </div>
          </template>
        </template>
        <template v-else>
          <a-form-item :label="$t('network.text_156')">
            <div slot="extra">
              <!-- - 泛解析域名：*.test.com，*一定在第一个字符，并且是*.或者*aaa.的格式，*不能在最后。<br /> -->{{$t('network.text_523')}}</div>
            <a-input v-decorator="decorators.domain" :placeholder="$t('network.text_522')" />
          </a-form-item>
          <a-form-item :label="$t('network.text_524')">
            <div slot="extra">
              {{$t('network.text_525')}}
              <span v-if="isDomainOrPathProviders" :class="{'error-color': !isDomainOrPath}">{{$t('common_465')}}</span>
            </div>
            <a-input v-decorator="decorators.path" :placeholder="$t('network.text_522')" />
          </a-form-item>
          <redirect-form-items v-if="isOneCloud" :form="form" @redirectChange="handleRedirectChange" />
          <template v-if="!isRedirect">
            <a-form-item :label="$t('network.default_backend_server_group')">
              <base-select
                resource="loadbalancerbackendgroups"
                need-params
                :params="bgParams"
                filterable
                v-decorator="decorators.backend_group"
                :select-props="{ placeholder: $t('network.text_394') }" />
            </a-form-item>
            <a-form-item v-if="isOneCloud" :label="$t('network.text_527')">
              <div slot="extra">{{$t('network.text_438')}}</div>
              <a-input :min="0" v-decorator="decorators.http_request_rate" :addonAfter="$t('network.text_439')" type="number" />
            </a-form-item>
            <a-form-item v-if="isOneCloud" :label="$t('network.text_440')">
              <div slot="extra">{{$t('network.text_528')}}</div>
              <a-input :min="0" v-decorator="decorators.http_request_rate_per_src" :addonAfter="$t('network.text_439')" type="number" />
            </a-form-item>
          </template>
        </template>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import RedirectFormItems from '@Network/views/loadbalancerlistener/components/RedirectFormItems'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { REGEXP } from '@/utils/validate'
import { REGIONS, COUNTRYS } from '../constants'

export default {
  name: 'LoadbalancerlistenerruleCreateDialog',
  components: {
    RedirectFormItems,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const provider = this.params.lbListenerData.provider.toLowerCase()
    const customDomain = (rule, value, callback) => {
      // 泛解析域名：*.test.com，*一定在第一个字符，并且是*.或者*aaa.的格式，*不能在最后。
      // const reg = /^\*.*\..[a-zA-Z]+/
      if (value === '' || REGEXP.domain.regexp.test(value)) {
        callback()
      } else {
        callback(new Error())
      }
      // else if (reg.test(value) && !value.endsWith('.')) {
      //   callback()
      // }
    }
    return {
      REGIONS,
      COUNTRYS,
      isRedirect: false,
      loading: false,
      isDomainOrPath: true,
      form: {
        fc: this.$form.createForm(this, { onValuesChange: this.onValuesChange }),
        fd: {
          domain_prefix: '',
          domain_name: '',
          redirect_type: 'off',
        },
      },
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('network.text_116') },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        domain: [
          'domain',
          {
            rules: [
              { required: provider === 'qcloud', message: this.$t('network.text_530') },
              { validator: customDomain, message: this.$t('network.text_531'), trigger: 'blur' },
            ],
          },
        ],
        domain_prefix: [
          'domain_prefix',
          {
            rules: [{
              required: true,
              validator: (rule, value, callback) => {
                if (!value) {
                  callback(new Error(this.$t('common.tips.input', [this.$t('network.domain_prefix')])))
                }
                const regex = /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]$/
                if (!regex.test(value)) {
                  callback(new Error(this.$t('network.domain_prefix_invalid')))
                }
                callback()
              },
            }],
          },
        ],
        domain_name: [
          'domain_name',
          {
            rules: [{ required: true, message: this.$t('common.tips.select', [this.$t('network.text_156')]) }],
          },
        ],
        path: [
          'path',
          {
            validateFirst: true,
            rules: [
              { required: provider === 'qcloud', message: this.$t('network.text_530') },
              { pattern: /^\/.+/, message: this.$t('network.text_529'), trigger: 'blur' },
            ],
          },
        ],
        backend_group: [
          'backend_group',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('network.text_394') },
            ],
          },
        ],
        backend_group_id: [
          'backend_group_id',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('network.default_backend_server_group')]) },
            ],
          },
        ],
        backend_groups: [
          'backend_groups',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('network.text_139')]) },
            ],
          },
        ],
        http_request_rate: [
          'http_request_rate',
          {
            normalize: v => Number(v),
            initialValue: 0,
          },
        ],
        http_request_rate_per_src: [
          'http_request_rate_per_src',
          {
            normalize: v => Number(v),
            initialValue: 0,
          },
        ],
        redirect_type: [
          'redirect_type',
          {
            initialValue: 'off',
            rules: [{ required: true, message: this.$t('network.rule_redirect_type') }],
          },
        ],
        redirect_region_type: (key) => [
          `redirect_region_type[${key}]`,
          {
            rules: [{ required: true, message: this.$t('network.rule_redirect_type') }],
          },
        ],
        redirect_region_country: (key) => [
          `redirect_region_country[${key}]`,
          {
            rules: [{ required: true, message: this.$t('network.text_203') }],
          },
        ],
        redirect_backend_groups: (key) => [
          `redirect_backend_groups[${key}]`,
          {
            rules: [{ required: true, message: this.$t('network.text_139') }],
          },
        ],
      },
      redirectRules: [
        {
          type: '',
          region: '',
          backend_group: '',
        },
      ],
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 6,
        },
      },
      formItemLayout2: {
        wrapperCol: {
          span: 24,
        },
        labelCol: {
          span: 24,
        },
      },
    }
  },
  computed: {
    bgParams () {
      const params = {
        scope: this.$store.getters.scope,
        loadbalancer: this.params.lbListenerData.loadbalancer_id,
      }
      if (this.params.lbListenerData.provider && this.params.lbListenerData.provider.toLowerCase() === 'aliyun') {
        params.type = 'normal'
      }
      return params
    },
    provider () {
      return this.params.lbListenerData.provider.toLowerCase()
    },
    isOneCloud () {
      return this.provider === 'onecloud'
    },
    isCloudflare () {
      return this.provider === 'cloudflare'
    },
    isDomainOrPathProviders () {
      return this.provider === 'huawei' || this.provider === 'aliyun' || this.provider === 'aws' || this.provider === 'openstack'
    },
    cdnDomainParams () {
      return {
        scope: this.$store.getters.scope,
        provider: this.params.lbListenerData.provider,
      }
    },
    backendParams () {
      return {
        scope: this.$store.getters.scope,
        loadbalancer: this.params.lbListenerData.loadbalancer_id,
        filter: 'status.in(enabled,disabled)',
        $t: 1,
      }
    },
    backendParams1 () {
      return {
        scope: this.$store.getters.scope,
        loadbalancer: this.params.lbListenerData.loadbalancer_id,
        filter: 'status.in(enabled,disabled)',
        $t: 2,
      }
    },
    currentUrl () {
      if (this.isCloudflare) {
        return `${this.form.fd.domain_prefix}.${this.form.fd.domain_name}`
      }
      return ''
    },
  },
  created () {
    this.form.fc.getFieldDecorator('listener_type', {
      preserve: true,
      initialValue: this.params.lbListenerData.listener_type,
    })
  },
  methods: {
    deleteRule (item, index) {
      this.redirectRules = this.redirectRules.filter((_, i) => i !== index)
    },
    addRule () {
      this.redirectRules.push({
        region: '',
        backend_group: '',
      })
    },
    genBackendParams (index) {
      return {
        scope: this.$store.getters.scope,
        loadbalancer: this.params.lbListenerData.loadbalancer_id,
        filter: 'status.in(enabled,disabled)',
        $t: `n${index}`,
      }
    },
    domainMapper (list) {
      return list.map(item => ({
        id: item.name,
        name: item.name,
      }))
    },
    handleRedirectChange (bool) {
      this.isRedirect = bool
    },
    async onValuesChange (props, values) {
      await this.$nextTick()
      const redirectKeys = ['redirect', 'redirect_scheme', 'redirect_host', 'redirect_path']
      if (redirectKeys.indexOf(Object.keys(values)[0]) > -1) {
        this.form.fc.resetFields(['check'])
        this.form.fc.validateFields(['check'])
      }
      const { path, domain } = this.form.fc.getFieldsValue(['path', 'domain'])
      if (this.isDomainOrPathProviders) {
        this.isDomainOrPath = path || domain
      }
      Object.keys(values).forEach((key) => {
        if (key === 'domain_name' || key === 'domain_prefix' || key === 'redirect_type') {
          this.form.fd[key] = values[key]
        }
        if (key === 'redirect_region_type') {
          this.$set(this.redirectRules[values[key].length - 1], 'type', values[key][values[key].length - 1])
        }
      })
    },
    async doCreate (values) {
      let data = { listener: this.params.lbListenerData.id }
      if (this.isCloudflare) {
        data.name = values.name
        data.domain = values.domain_name
        data.path = `${values.domain_prefix}.${values.domain_name}`
        data.backend_groups = values.backend_groups.map(id => ({ id }))
        data.backend_group_id = values.backend_group_id
        if (values.redirect_type === 'geography') {
          data.redirect_pool = {
            region_pools: {},
            country_pools: {},
          }
          values.redirect_region_type.map((type, index) => {
            if (type === 'region') {
              data.redirect_pool.region_pools[values.redirect_region_country[index]] = values.redirect_backend_groups[index].map(id => ({ id }))
            } else {
              data.redirect_pool.country_pools[values.redirect_region_country[index]] = values.redirect_backend_groups[index].map(id => ({ id }))
            }
          })
        }
      } else {
        data = {
          ...values,
          ...data,
        }
      }
      await new this.$Manager('loadbalancerlistenerrules').create({
        data,
      })
    },
    async handleConfirm () {
      try {
        const { path, domain } = this.form.fc.getFieldsValue(['path', 'domain'])
        const values = await this.form.fc.validateFields()
        if (this.isDomainOrPathProviders) {
          this.isDomainOrPath = path || domain
          if (!(path || domain)) {
            return false
          }
        }
        this.loading = true
        values.redirect = values.redirect ? 'raw' : 'off'
        if (!values.redirect_host) {
          delete values.redirect_host
        }
        await this.doCreate(values)
        this.loading = false
        this.cancelDialog()
        this.params.refresh()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
