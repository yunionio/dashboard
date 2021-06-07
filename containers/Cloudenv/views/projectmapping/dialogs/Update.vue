<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('cloudenv.text_202')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('cloudenv.text_580')" :count="params.data.length" :action="$t('cloudenv.text_593')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <!-- 应用账号 -->
        <a-form-item :label="$t('cloudenv.text_589')" v-bind="formItemLayout">
          <a-select v-decorator="decorators.accounts" dropdownClassName="oc-select-dropdown" :showSearch="true" mode="multiple" option-filter-prop="children" :placeholder="$t('cloudenv.text_284', [$t('cloudenv.text_589')])" allowClear>
            <a-select-option v-for="item in accountOptions" :key="item.id" :value="item.id" :disabled="disabledFilter(item.project_mapping, item.id)">
              <a-tooltip :title="disabledFilter(item.project_mapping, item.id)?$t('cloudenv.text_603'):''" placement="topLeft" arrow-point-at-center>
                <a-row>
                <a-col :span="16">
                  <div>{{ item.name }}</div>
                </a-col>
                <a-col :span="8" align="right">
                  <div class="text-color-secondary option-show" style="text-align: right;display:none">
                    {{ item.brand }}
                  </div>
                </a-col>
                </a-row>
              </a-tooltip>
            </a-select-option>
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
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { findPlatform, typeClouds } from '@/utils/common/hypervisor'
const brandMap = typeClouds.getBrand()

export default {
  name: 'ProjectMappingUpdateDialog',
  components: {
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const initProjectDomainId = this.params.data[0].omain_id || 'default'
    let initAccountsValue = []
    let initAccountsOptions = []
    if (this.params.data[0].accounts) {
      initAccountsValue = this.params.data[0].accounts.map(item => {
        return item.id
      })
      initAccountsOptions = this.params.data[0].accounts.map(item => {
        return {
          id: item.id,
          name: item.name,
        }
      })
    }
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        accounts: [
          'accounts',
          {
            initialValue: initAccountsValue,
            rules: [
              { required: false, message: '请选择应用账号' },
            ],
          },
        ],
      },
      accountOptions: initAccountsOptions,
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      projectDomainId: initProjectDomainId,
    }
  },
  watch: {
    projectDomainId: {
      handler: function (val) {
        if (val) {
          this.fetchCloudAccount()
        }
      },
      immediate: true,
    },
  },
  created () {
    this.initFormValues(this.params.data[0])
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
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
