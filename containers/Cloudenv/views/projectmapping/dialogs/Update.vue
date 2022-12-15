<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('cloudenv.text_554')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('cloudenv.text_580')" :count="params.data.length" :action="$t('cloudenv.text_459')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form-model
        v-bind="formItemLayout"
        ref="ruleForm" :model="formData" :rules="rules">
        <!-- 应用范围 -->
        <application-scope
          :formData="formData"
          :params="{ project_domains: projectDomainId, filter: 'project_mapping_id.isnullorempty()', brand: ['Aws', 'Azure', 'Aliyun', 'Qcloud', 'Huawei', 'Google'] }"  />
      </a-form-model>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import ApplicationScope from '../components/ApplicationScope'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { findPlatform, typeClouds } from '@/utils/common/hypervisor'
const brandMap = typeClouds.getBrand()

export default {
  name: 'ProjectMappingUpdateDialog',
  components: {
    ApplicationScope,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const initProjectDomainId = this.params.data[0].domain_id || 'default'
    let initAccountsValue = []
    let initCloudprovidersValue = []
    let applicationScope = 1
    // let initAccountsOptions = []
    if (this.params.data[0].accounts) {
      initAccountsValue = this.params.data[0].accounts.map(item => {
        return item.id
      })
      applicationScope = 1
    }
    if (this.params.data[0].managers) {
      initCloudprovidersValue = this.params.data[0].managers.map(item => {
        return item.id
      })
      applicationScope = 2
    }
    return {
      loading: false,
      formData: {
        application_scope: applicationScope,
        accounts: initAccountsValue,
        cloudproviders: initCloudprovidersValue,
      },
      rules: {
        application_scope: [
          { required: true },
        ],
      },
      // accountOptions: initAccountsOptions,
      formItemLayout: {
        wrapperCol: {
          span: 19,
        },
        labelCol: {
          span: 5,
        },
      },
      projectDomainId: initProjectDomainId,
    }
  },
  watch: {
    projectDomainId: {
      handler: function (val) {
        if (val) {
          // this.fetchCloudAccount()
        }
      },
      immediate: true,
    },
  },
  created () {
    this.initFormValues(this.params.data[0])
  },
  methods: {
    async doUnBindAllAccounts (accounts) {
      await new this.$Manager('cloudaccounts').batchPerformAction({
        ids: accounts,
        action: 'project-mapping',
        data: {},
      })
    },
    async doUnBindAllCloudProviders (cloudproviders) {
      await new this.$Manager('cloudproviders').batchPerformAction({
        ids: cloudproviders,
        action: 'project-mapping',
        data: {},
      })
    },
    async doBindAccounts (values) {
      const { accounts } = this.params.data[0] // 原先绑定的
      if (accounts) {
        const deleteAccounts = []
        accounts.map(item => {
          let isHas = false
          if (values.accounts) {
            values.accounts.map(item2 => {
              if (item2 === item.id) {
                isHas = true
              }
            })
          }
          if (!isHas) {
            deleteAccounts.push(item.id)
          }
        })
        if (deleteAccounts.length) {
          // 解绑
          await new this.$Manager('cloudaccounts').batchPerformAction({
            ids: deleteAccounts,
            action: 'project-mapping',
            data: { },
          })
        }
      }
      // 新绑定
      if (values.accounts && values.accounts.length) {
        await new this.$Manager('cloudaccounts').batchPerformAction({
          ids: values.accounts,
          action: 'project-mapping',
          data: { project_mapping_id: this.params.data[0].id },
        })
      }
    },
    async doBindCloudproviders (values) {
      const { managers } = this.params.data[0] // 原先绑定的
      if (managers) {
        const deleteCloudproviders = []
        managers.map(item => {
          let isHas = false
          if (values.cloudproviders) {
            values.cloudproviders.map(item2 => {
              if (item2 === item.id) {
                isHas = true
              }
            })
          }
          if (!isHas) {
            deleteCloudproviders.push(item.id)
          }
        })
        if (deleteCloudproviders.length) {
          // 解绑
          await new this.$Manager('cloudproviders').batchPerformAction({
            ids: deleteCloudproviders,
            action: 'project-mapping',
            data: { },
          })
        }
      }
      // 新绑定
      if (values.cloudproviders && values.cloudproviders.length) {
        await new this.$Manager('cloudproviders').batchPerformAction({
          ids: values.cloudproviders,
          action: 'project-mapping',
          data: { project_mapping_id: this.params.data[0].id },
        })
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        const validate = await this.$refs.ruleForm.validate()
        if (!validate) return
        const { application_scope } = this.formData
        const { accounts, managers } = this.params.data[0]
        if (application_scope === 1) {
          managers && await this.doUnBindAllCloudProviders(managers.map(v => v.id))
          await this.doBindAccounts(this.formData)
        } else if (application_scope === 2) {
          accounts && await this.doUnBindAllAccounts(accounts.map(v => v.id))
          await this.doBindCloudproviders(this.formData)
        }
        this.loading = false
        this.cancelDialog()
        this.$bus.$emit('ProjectMappingRuleUpdate')
        this.$message.success(this.$t('common.success'))
      } catch (error) {
        this.loading = false
      }
    },
    initFormValues ({ domain_id }) {
      if (domain_id) {
        this.projectDomainId = domain_id
      }
      if (this.params.data[0].accounts) {
        this.accountOptions = this.params.data[0].accounts
        this.accountsSelected = this.params.data[0].accounts.map(item => {
          return item.id
        })
      }
    },
    async fetchCloudAccount () {
      this.$d = new this.$Manager('cloudaccounts')
      this.accountOptions = undefined
      try {
        const params = {
          scope: this.$store.getters.scope,
          project_domain_id: this.projectDomainId,
        }
        const { data } = await this.$d.list({ params })
        const cloudAccounts = data.data || []
        const accountOptions = []
        cloudAccounts.map(item => {
          const isPublic = findPlatform(item.brand.toLowerCase()) === 'public'
          if (isPublic) {
            accountOptions.push({
              id: item.id,
              name: item.name,
              brand: this.$t('cloudenv.text_102') + ': ' + brandMap[item.brand].label,
              project_mapping: item.project_mapping || false,
            })
          }
        })
        this.accountOptions = accountOptions
      } catch (err) {
        throw err
      } finally {
      }
    },
    disabledFilter (isBind, accountId) {
      if (!isBind) {
        return false
      } else {
        const { accounts = [] } = this.params.data[0]
        const isBindToThis = accounts.some((item) => {
          return item.id === accountId
        })
        return !isBindToThis
      }
    },
  },
}
</script>
