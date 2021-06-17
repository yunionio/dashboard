<template>
  <base-dialog :width="1000" @cancel="cancelDialog">
    <div slot="header">{{$t('cloudenv.text_583')}}</div>
    <div slot="body">
      <a-form
        v-bind="formLayout"
        :form="form.fc">
        <!-- 域 -->
        <a-form-item :label="$t('dictionary.domain')" v-bind="formLayout">
          <domain-select v-if="isAdminMode && l3PermissionEnable" v-decorator="decorators.project_domain_id" :params="domainParams" @change="handleDomainChange" />
          <template v-else> {{userInfo.domain.name}} </template>
        </a-form-item>
        <!-- 名称 -->
        <a-form-item :label="$t('cloudenv.text_95')">
          <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceName')" />
        </a-form-item>
        <!-- 规则 -->
        <a-form-item :label="$t('cloudenv.text_582')">
          <div v-for="(item,index) in form.fc.getFieldValue('rules')" :key="item" :value="item" class="d-flex align-items-center">
            <a-card v-if="item !== -1" class="mb-3" style="flex: 1 1 auto">
              <!-- 匹配条件 -->
              <a-form-item :label="$t('cloudenv.text_22')" v-bind="formLayout">
                <a-select v-decorator="[
                  `matchs[${item}]`,
                  {
                    initialValue: 'or',
                    rules: [
                      {
                        required: true,
                        message: $t('cloudenv.text_284', [$t('cloudenv.text_22')]),
                      },
                    ],
                  }
                ]">
                  <a-select-option v-for="item in resourceAndTagOptions" :value="item.value" :key="item.value">
                    {{item.name}}
                  </a-select-option>
                </a-select>
                <div slot="extra" class="d-flex">
                  {{$t('cloudenv.text_585')}}
                </div>
              </a-form-item>
              <!-- 标签 -->
              <a-form-item :label="$t('cloudenv.text_16')" v-bind="formLayout">
                <tag v-decorator="[
                  `tags[${item}]`,
                  {
                    rules: [
                      {
                        required: true,
                        message: $t('cloudenv.text_602'),
                        validator: tagsLengthValidate
                      },
                    ],
                  }
                ]" />
              </a-form-item>
              <!-- 资源映射 -->
              <a-form-item :label="$t('cloudenv.text_584')" v-bind="formLayout">
                <a-select v-decorator="[
                  `maps[${item}]`,
                  {
                    rules: [
                      {
                        required: true,
                        message: $t('cloudenv.text_284', [$t('cloudenv.text_584')]),
                      },
                    ],
                  }
                ]">
                  <a-select-option v-for="item in projectOptions" :key="item.id" :value="item.id">
                    {{item.name}}
                  </a-select-option>
                </a-select>
                <div slot="extra" class="d-flex">
                  {{$t('cloudenv.text_592')}}
                </div>
              </a-form-item>
            </a-card>
            <a-button v-if="item !== -1" style="flex: 0 0 24px;margin-left: 20px" shape="circle" icon="minus" size="small" @click="deleteRule(item,index)" />
          </div>
          <!-- 添加 -->
          <div class="d-flex align-items-center">
            <a-button type="primary" shape="circle" icon="plus" size="small" @click="addRule" />
            <a-button type="link" @click="addRule">{{$t('cloudenv.text_586')}}</a-button>
          </div>
        </a-form-item>
        <!-- 应用范围 -->
        <application-scope :decorators="decorators" :form="form" :params="{ project_domains: projectDomainId, filter: 'project_mapping_id.isnullorempty()' }" />
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import Tag from '../components/Tag'
import ApplicationScope from '../components/ApplicationScope'
import DomainSelect from '@/sections/DomainSelect'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { findPlatform, typeClouds } from '@/utils/common/hypervisor'
const brandMap = typeClouds.getBrand()

let id = 0
export default {
  name: 'ProjectMappingCreateDialog',
  components: {
    DomainSelect,
    Tag,
    ApplicationScope,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const projectDomainInitialValue = (this.params.domain && this.params.domain.key) || this.$store.getters.userInfo.projectDomainId
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.form.fd[key] = values[key]
            })
          },
        }),
        fd: {
          applicationScope: 1,
        },
      },
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('cloudenv.text_190') },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        project_domain_id: [
          'project_domain_id',
          {
            initialValue: projectDomainInitialValue,
            rules: [
              { required: true, message: this.$t('cloudenv.text_284', [this.$t('dictionary.domain')]) },
            ],
          },
        ],
        applicationScope: [
          'applicationScope',
          {
            initialValue: 1,
          },
        ],
        accounts: [
          'accounts',
          {
            rules: [
              { required: false, message: this.$t('cloudenv.text_284', [this.$t('cloudenv.text_589')]) },
            ],
          },
        ],
        cloudproviders: [
          'cloudproviders',
          {
            rules: [
              { required: false, message: this.$t('cloudenv.text_284', [this.$t('cloudenv.project_mapping_use_cloudprovider')]) },
            ],
          },
        ],
      },
      formLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      offsetFormLayout: {
        wrapperCol: {
          span: 18,
          offset: 6,
        },
      },
      domainParams: {
        limit: 0,
        filter: 'enabled.equals(1)',
      },
      resourceAndTagOptions: [
        {
          id: 1,
          name: this.$t('cloudenv.text_587'),
          value: 'or',
        },
        {
          id: 2,
          name: this.$t('cloudenv.text_588'),
          value: 'and',
        },
      ],
      projectOptions: [],
      accountOptions: [],
      projectDomainId: projectDomainInitialValue,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo', 'l3PermissionEnable']),
  },
  watch: {
    projectDomainId: {
      handler: function (val) {
        if (val) {
          // this.fetchCloudAccount()
          this.fetchProject()
        }
      },
      immediate: true,
    },
  },
  mounted () {
    this.form.fc.getFieldDecorator('rules', { initialValue: [], preserve: true })
  },
  methods: {
    handleDomainChange (id) {
      this.form.fc.setFieldsValue({
        project_domain_id: id,
      })
      this.projectDomainId = id
    },
    async fetchCloudAccount () {
      this.$d = new this.$Manager('cloudaccounts')
      this.accountOptions = undefined
      this.form.fc.setFieldsValue({
        accounts: [],
      })
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
    async fetchProject () {
      this.$p = new this.$Manager('projects', 'v1')
      this.projectOptions = undefined
      this.form.fc.setFieldsValue({
        maps: [],
        rules: [],
      })
      try {
        const params = {
          scope: this.$store.getters.scope,
          project_domain_id: this.projectDomainId,
        }
        const { data } = await this.$p.list({ params })
        const projects = data.data || []
        this.projectOptions = projects.map(item => {
          return {
            id: item.id,
            name: item.name,
            value: item.name,
            // brand: this.$t('dashboard.text_98') + ': ' + item.brand,
          }
        })
      } catch (err) {
        throw err
      } finally {
      }
    },
    doCreate (data) {
      return new this.$Manager('project_mappings').create({ data: data })
    },
    doBindByAccount ({ accountIds, project_mapping_id }) {
      const manager = new this.$Manager('cloudaccounts')
      return manager.batchPerformAction({
        ids: accountIds,
        action: 'project-mapping',
        data: { project_mapping_id },
      })
    },
    doBindByCloudProvider ({ cloudproviderIds, project_mapping_id }) {
      const manager = new this.$Manager('cloudproviders')
      return manager.batchPerformAction({
        ids: cloudproviderIds,
        action: 'project-mapping',
        data: { project_mapping_id },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const { applicationScope } = this.form.fd
        // 获取参数
        const params = this.getCreateParams(values)
        const createResult = await this.doCreate(params)
        const { id } = createResult.data
        if (applicationScope === 1 && values.accounts?.length > 0) {
          await this.doBindByAccount({ accountIds: values.accounts, project_mapping_id: id })
        } else if (applicationScope === 2 && values.cloudproviders?.length > 0) {
          await this.doBindByCloudProvider({ cloudproviderIds: values.cloudproviders, project_mapping_id: id })
        }
        this.cancelDialog()
        this.params.success && this.params.success()
        this.$message.success(this.$t('cloudenv.text_381'))
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    getCreateParams ({ project_domain_id, name, rules, tags, matchs, maps }) {
      const result = {
        project_domain_id,
        name,
        rules: [],
      }
      result.rules = rules.map((item, index) => {
        if (item !== -1 && tags[item] && matchs[item] && maps[item]) {
          return {
            condition: matchs[item],
            project_id: maps[item],
            tags: this.getTagValue(tags[item]),
          }
        }
      }).filter(item => {
        return !!item
      })
      return result
    },
    getTagValue (tag) {
      const result = []
      const keys = Object.keys(tag)
      keys.map(key => {
        result.push({
          key: R.replace(/(ext:|user:)/, '', key),
          value: tag[key],
        })
      })
      return result
    },
    addRule () {
      const { form } = this
      const keys = form.fc.getFieldValue('rules')
      const nextKeys = keys.concat(id++)
      // const matchs = form.fc.getFieldValue('maps') || []
      // const nextMatchs = matchs.concat(this.projectOptions.length ? this.projectOptions[0].id : '')
      form.fc.setFieldsValue({
        rules: nextKeys,
        // maps: nextMatchs,
      })
    },
    deleteRule (item, idx) {
      const { form } = this
      const rules = form.fc.getFieldValue('rules')
      const nextRules = rules.map(rule => {
        if (rule === item) {
          return -1
        }
        return rule
      })
      form.fc.setFieldsValue({
        rules: nextRules,
      })
    },
    tagsLengthValidate (rule, value, callback) {
      if (value) {
        const keys = Object.keys(value)
        if (keys.length > 20) {
        // eslint-disable-next-line
        callback(false)
        } else {
          callback()
        }
      } else {
        // eslint-disable-next-line
        callback(false)
      }
    },
  },
}
</script>
