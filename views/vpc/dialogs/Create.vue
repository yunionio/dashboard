<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">新建VPC</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item v-bind="formItemLayout" :label="`指定${$t('dictionary.domain')}`" v-if="$store.getters.isAdminMode">
          <domain-select v-decorator="decorators.project_domain" @change="handleDomainChange" />
        </a-form-item>
        <a-form-item label="名称" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" placeholder="字母开头，数字和字母大小写组合，长度为2-20个字符，可含'-','_'" />
        </a-form-item>
        <a-form-item label="平台" v-bind="formItemLayout">
          <a-radio-group v-decorator="decorators.platform">
            <a-radio-button value="idc">本地IDC</a-radio-button>
            <a-radio-button value="private_cloud">私有云</a-radio-button>
            <a-radio-button value="public_cloud">公有云</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="区域" v-bind="formItemLayout" v-if="platform !== 'idc'">
          <cloudprovider-region
           @update:region="handleRegionChange"
           :decorator="decorators"
           :cloudproviderParams="cloudproviderParams"
           :regionParamsExtra="regionParamsExtra" />
        </a-form-item>
        <a-form-item label="区域" v-bind="formItemLayout" v-else>
          <base-select
            resource="cloudregions"
            v-decorator="decorators.idcRegion"
            :selectProps="{ 'placeholder': '请选择区域' }"
            :params="idcCloudRegionParams" />
        </a-form-item>
        <a-form-item v-if="!isGoogle || platform !== 'public_cloud'" label="目标网段" v-bind="formItemLayout" :extra="platform !== 'idc' ? '一旦创建成功，网段不能修改。支持使用 192.168.0.0/16、172.16.0.0/12、10.0.0.0/8 及其子网作为VPC地址段。' : '一旦创建成功，网段不能修改。'">
          <a-input v-decorator="decorators.cidr_block" placeholder="请输入IP段，例如：192.168.0.0/16" v-if="platform !== 'idc'" />
          <a-select v-decorator="decorators.cidr_block" v-else>
            <a-select-option value="192.168.0.0/16">192.168.0.0/16</a-select-option>
            <a-select-option value="172.16.0.0/12">172.16.0.0/12</a-select-option>
            <a-select-option value="10.0.0.0/8">10.0.0.0/8</a-select-option>
          </a-select>
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
import CloudproviderRegion from '@/sections/CloudproviderRegion'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import DomainSelect from '@/sections/DomainSelect'

export default {
  name: 'VpcCreateDialog',
  components: {
    CloudproviderRegion,
    DomainSelect,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      isGoogle: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            if (values.platform) {
              this.platform = values.platform
            }
          },
        }),
      },
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            validateTrigger: ['blur'],
            rules: [
              { required: true, message: '请输入VPC名称' },
              { validator: this.$validate('broadName') },
            ],
          },
        ],
        platform: [
          'platform',
          // {
          //   initialValue: this.platformInitialValue,
          // },
        ],
        cloudprovider: [
          'cloudprovider',
          {
            rules: [
              { required: true, message: '请输入区域' },
            ],
          },
        ],
        region: [
          'region',
          {
            rules: [
              { required: true, message: '请输入区域' },
            ],
          },
        ],
        idcRegion: [
          'idcRegion',
          {
            rules: [
              { required: true, message: '请输入区域' },
            ],
          },
        ],
        cidr_block: [
          'cidr_block',
          {
            validateFirst: true,
            validateTrigger: ['blur'],
            rules: [
              { required: true, message: '目标网段不能为空' },
              { validator: this.$validate('CIDR') },
            ],
          },
        ],
        project_domain: [
          'project_domain',
          {
            initialValue: this.$store.getters.userInfo.projectDomainId,
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
      platform: 'public_cloud',
      project_domain: this.$store.getters.userInfo.projectDomainId,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'userInfo']),
    cloudproviderParams () {
      const params = {
        limit: 0,
        enabled: 1,
        details: true,
        scope: this.scope,
      }
      if (this.platform) params[this.platform] = true
      if (this.isAdminMode) {
        params.admin = true
        params.project_domain = this.project_domain
        delete params.scope
        delete params.domain_id
      }
      return params
    },
    idcCloudRegionParams () {
      if (this.isAdminMode) {
        return {
          cloud_env: 'onpremise',
          usable: true,
          show_emulated: true,
          project_domain: this.project_domain,
        }
      }
      return {
        cloud_env: 'onpremise',
        usable: true,
        show_emulated: true,
      }
    },
    regionParamsExtra () {
      const res = {}
      if (this.platform === 'public_cloud') {
        res.cloud_env = 'public'
      } else if (this.platform === 'private_cloud') {
        res.cloud_env = 'private'
      }
      return res
    },
    platformInitialValue () {
      switch (this.params.createType) {
        case 'onpremise':
          return 'idc'
        case 'private':
          return 'private_cloud'
        case 'public':
          return 'public_cloud'
      }
      return 'public_cloud'
    },
  },
  provide () {
    return {
      form: this.form,
    }
  },
  created () {
    this.form.fc.getFieldDecorator('platform', { initialValue: this.platformInitialValue, preserve: true })
    this.platform = this.platformInitialValue
  },
  methods: {
    handleRegionChange (item) {
      if (item) {
        const { provider } = item
        this.isGoogle = provider.toLowerCase() === 'google'
      }
    },
    async checkIp (rule, value, callback) {
      const params = {
        search: value,
      }
      const data = await new this.$Manager('reservedips').list({ params })
      if (data.data.data.length >= 1) {
        callback(new Error('该IP已被预留,请勿重复添加'))
      } else {
        const ips = Object.values(this.form.fc.getFieldValue('networkIps'))
        const ipsRepreat = Array.from(new Set(ips))
        if (ipsRepreat.length === ips.length) {
          callback()
        } else {
          callback(new Error('请勿重复添加相同IP'))
        }
      }
    },
    doCreate (data) {
      return this.params.onManager('create', {
        managerArgs: {
          data,
        },
      })
    },
    handleDomainChange (val) {
      this.project_domain = val
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        let params = {}
        if (values.region) {
          params = {
            cloudregion_id: values.region.key,
            manager: values.cloudprovider.key,
            name: values.name,
          }
        } else {
          params = {
            cloudregion_id: values.idcRegion,
            name: values.name,
          }
        }
        if (!this.isGoogle) {
          params.cidr_block = values.cidr_block
        }
        if (values.project_domain) {
          params.project_domain = values.project_domain
        }
        await this.doCreate(params)
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
