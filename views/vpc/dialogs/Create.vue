<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">新建</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item label="名称" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" placeholder="字母开头，数字和字母大小写组合，长度为2-20个字符，可含'-','_'" />
        </a-form-item>
        <a-form-item label="平台" v-bind="formItemLayout">
          <a-radio-group v-decorator="decorators.platform">
            <a-radio-button value="public_cloud">公有云</a-radio-button>
            <a-radio-button value="private_cloud">私有云</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="区域" v-bind="formItemLayout">
          <cloudprovider-region
           :decorator="decorators"
           :cloudproviderParams="cloudproviderParams" />
        </a-form-item>
        <a-form-item label="目标网段" v-bind="formItemLayout">
          <a-input v-decorator="decorators.cidr_block" placeholder="请输入IP段，例如：192.168.0.0/16" />
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

export default {
  name: 'VpcCreateDialog',
  components: {
    CloudproviderRegion,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            if (values['platform']) {
              this.platform = values['platform']
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
          {
            initialValue: 'public_cloud',
          },
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
      if (this.isAdminMode) params['admin'] = true
      if (this.platform) params[this.platform] = true
      if (this.isAdminMode && !params['project_domain']) {
        params['project_domain'] = this.userInfo.projectDomainId
        delete params.scope
        delete params.domain_id
      }
      return params
    },
  },
  provide () {
    return {
      form: this.form,
    }
  },
  methods: {
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
      return this.params.list.onManager('create', {
        managerArgs: {
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        let values = await this.form.fc.validateFields()
        const params = {
          cidr_block: values.cidr_block,
          cloudregion_id: values.region.key,
          manager: values.cloudprovider.key,
          name: values.name,
        }
        await this.doCreate(params)
        this.loading = false
        this.cancelDialog()
        this.params.list.refresh()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
