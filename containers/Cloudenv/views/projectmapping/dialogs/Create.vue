<template>
  <base-dialog :width="1000" @cancel="cancelDialog">
    <div slot="header">{{$t('cloudenv.text_583')}}</div>
    <div slot="body" style="max-height:calc(100vh - 320px);overflow-y:auto">
      <a-form-model ref="ruleForm" :model="formData" :rules="rules" v-bind="layout">
        <!-- 域 -->
        <a-form-model-item :label="$t('dictionary.domain')" prop="project_domain_id">
          <domain-select v-model="formData.project_domain_id" v-if="isAdminMode && l3PermissionEnable" :params="domainParams" />
          <template v-else> {{userInfo.projectDomain}} </template>
        </a-form-model-item>
        <!-- 名称 -->
        <a-form-model-item :label="$t('cloudenv.text_95')" prop="name">
          <a-input v-model="formData.name" :placeholder="$t('validator.resourceName')" />
        </a-form-model-item>
        <a-form-model-item :label="$t('common.description')">
          <a-textarea v-model="formData.description" :rows="1" :auto-size="{ minRows: 1, maxRows: 3 }" :placeholder="$t('common_367')" />
        </a-form-model-item>
        <!-- 规则 -->
        <a-form-model-item :label="$t('cloudenv.text_582')" :rules="rules.rules" prop="rules">
          <div v-for="(item,index) in formData.rules" :key="index" class="d-flex align-items-center">
            <a-card class="mb-3" style="flex: 1 1 auto">
              <!-- 条件 -->
              <a-form-model-item :label="$t('cloudenv.text_22')" v-bind="layout" :rules="rules.condition" :prop="`rules.${index}.condition`">
                <a-select v-model="item.condition">
                  <a-select-option v-for="item in resourceAndTagOptions" :value="item.value" :key="item.value" :disabled="item.value === 'and_copy' && isSecAndcopy(index)">
                    {{item.name}}
                  </a-select-option>
                </a-select>
              </a-form-model-item>
              <!-- 标签key -->
              <template v-if="item.condition === 'and_copy'">
                <a-form-model-item :label="$t('cloudenv.tag_key')" v-bind="layout" :rules="rules.tag_key" :prop="`rules.${index}.tag_key`">
                  <a-input v-model="item.tag_key" />
                </a-form-model-item>
              </template>
              <template v-else>
                <!-- 标签 -->
                <a-form-model-item :label="$t('cloudenv.text_16')" v-bind="layout" :rules="rules.tags" :prop="`rules.${index}.tags`">
                  <tag v-model="item.tags" @change="(val) => handleTagChange(val, index)" />
                </a-form-model-item>
                <!-- 项目 -->
                <a-form-model-item :label="$t('cloudenv.text_584')" :extra="$t('cloudenv.text_592')" v-bind="layout" :rules="rules.project_id" :prop="`rules.${index}.project_id`">
                  <a-select v-model="item.project_id" show-search option-filter-prop="children" :filter-option="filterOption">
                    <a-select-option v-for="item in projectOptions" :key="item.id" :value="item.id">
                      {{item.name}}
                    </a-select-option>
                  </a-select>
                </a-form-model-item>
              </template>
            </a-card>
            <a-button style="flex: 0 0 24px;margin-left: 20px" shape="circle" icon="minus" size="small" @click="deleteRule(item,index)" />
          </div>
          <div class="d-flex align-items-center">
            <a-button type="primary" shape="circle" icon="plus" size="small" @click="addRule" />
            <a-button type="link" @click="addRule">{{$t('cloudenv.text_586')}}</a-button>
          </div>
        </a-form-model-item>
        <a-form-model-item :label="$t('cloudenv.text_282')" prop="public_scope">
          <a-radio-group v-model="formData.public_scope">
            <a-radio-button value="none">{{$t('cloudenv.text_285')}}</a-radio-button>
            <a-radio-button v-if="isAdminMode" value="system">{{$t('cloudenv.global_share')}}</a-radio-button>
          </a-radio-group>
        </a-form-model-item>
      </a-form-model>
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
import DomainSelect from '@/sections/DomainSelect'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import Tag from '../components/Tag'

export default {
  name: 'ProjectMappingCreateDialog',
  components: {
    DomainSelect,
    Tag,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const projectDomainInitialValue = (this.params.domain && this.params.domain.key) || this.$store.getters.userInfo.projectDomainId
    return {
      loading: false,
      formData: {
        project_domain_id: projectDomainInitialValue,
        name: '',
        description: '',
        rules: [],
        public_scope: 'none',
      },
      rules: {
        name: [
          { required: true, message: this.$t('cloudenv.text_190') },
          { validator: this.$validate('resourceName') },
        ],
        project_domain_id: [
          { required: true, message: this.$t('cloudenv.text_284', [this.$t('dictionary.domain')]) },
        ],
        rules: [
          { required: true, validator: this.validateRules },
        ],
        condition: [
          { required: true, message: this.$t('common.tips.select', [this.$t('cloudenv.text_22')]) },
        ],
        tags: [
          { required: true, validator: this.validateTags },
        ],
        tag_key: [
          { required: true, message: this.$t('common.tips.input', [this.$t('cloudenv.tag_key')]) },
        ],
        project_id: [
          { required: true, message: this.$t('common.tips.select', [this.$t('cloudenv.text_584')]) },
        ],
        public_scope: [
          { required: true },
        ],
      },
      layout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 6,
        },
      },
      offsetLayout: {
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
        {
          id: 3,
          name: this.$t('cloudenv.match_by_tag_key'),
          value: 'and_copy',
        },
      ],
      projectOptions: [],
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
  },
  methods: {
    async fetchProject () {
      this.$p = new this.$Manager('projects', 'v1')
      this.projectOptions = undefined
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
        const validate = await this.$refs.ruleForm.validate()
        if (!validate) return
        // 获取参数
        const params = this.getCreateParams()
        await this.doCreate(params)
        this.cancelDialog()
        this.params.success && this.params.success()
        this.$message.success(this.$t('cloudenv.text_381'))
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    getCreateParams () {
      const { project_domain_id, name, description, public_scope, rules = [] } = this.formData
      const result = {
        project_domain_id,
        name,
        description,
        rules: [],
        public_scope,
      }
      result.rules = rules.map((item, index) => {
        if (item.condition === 'and_copy') {
          return {
            condition: 'and',
            tags: [{ key: item.tag_key }],
            auto_create_project: true,
          }
        } else {
          return {
            condition: item.condition,
            project_id: item.project_id,
            tags: this.getTagValue(item.tags),
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
    handleTagChange (val, index) {
      this.formData.rules[index].tags = val
    },
    addRule () {
      this.formData.rules.push({
        condition: 'or',
        tags: {},
        tag_key: '',
        project_id: '',
      })
    },
    deleteRule (item, idx) {
      this.formData.rules = this.formData.rules.filter((item, index) => index !== idx)
    },
    validateRules (rule, value, callback) {
      if (!this.formData.rules.length) {
        callback(new Error(this.$t('cloudenv.add_rule_tip')))
      }
      callback()
    },
    validateTags (rule, value, callback) {
      if (value) {
        const keys = Object.keys(value)
        if (!keys.length) {
          callback(new Error(this.$t('common.tips.select', [this.$t('cloudenv.text_16')])))
        } else if (keys.length > 20) {
          callback(new Error(this.$t('cloudenv.text_602')))
        } else {
          callback()
        }
      } else {
        callback(new Error(this.$t('common.tips.select', [this.$t('cloudenv.text_16')])))
      }
    },
    isSecAndcopy (index) {
      let has = false
      this.formData.rules.map((item, idx) => {
        if (item.condition === 'and_copy' && index !== idx) {
          has = true
        }
      })
      return has
    },
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
  },
}
</script>
