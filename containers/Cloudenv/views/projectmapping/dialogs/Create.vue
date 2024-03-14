<template>
  <base-dialog :width="1000" @cancel="cancelDialog">
    <div slot="header">{{$t('cloudenv.text_583')}}</div>
    <div slot="body" style="max-height:calc(100vh - 320px);overflow-y:auto">
      <a-alert class="mb-3" :message="$t('cloudenv.project_mapping_rule_priority')" />
      <a-form-model ref="ruleForm" :model="formData" :rules="rules" v-bind="layout" :validateOnRuleChange="true">
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
                  <tag v-if="tagShow" :defaultChecked="item.tags" @change="(val) => handleTagChange(val, index)" />
                </a-form-model-item>
                <a-form-model-item :label="$t('cloudenv.belong_type')" v-bind="layout" :rules="rules.belong_type" :prop="`rules.${index}.belong_type`">
                  <a-form-model-item class="mb-0" :extra="item.belong_type === 'project_id' ? $t('cloudenv.text_592') : $t('cloudenv.belong_project_name_tip')">
                    <a-radio-group v-model="item.belong_type" @change="validateBt(index)">
                      <a-radio-button value="project_id">{{ $t('cloudenv.target_project') }}</a-radio-button>
                      <a-radio-button value="project">{{ $t('cloudenv.target_name') }}</a-radio-button>
                    </a-radio-group>
                    <base-select
                      v-if="item.belong_type === 'project_id'"
                      resource="projects"
                      remote
                      :params="{...projectParams, $t: index}"
                      v-model="item.project_id"
                      :select-props="{placeholder: $t('common.tips.select', [$t('dictionary.project')])}"
                      @change="validateBt(index)" />
                    <a-input v-else type="text" v-model="item.project" :placeholder="$t('common.tips.input', [$t('dictionary.project')])" @change="validateBt(index)" />
                  </a-form-model-item>
                </a-form-model-item>
              </template>
            </a-card>
            <div>
              <div v-if="formData.rules.length > 1 && index !== 0"><a-button icon="vertical-align-top" style="flex: 0 0 24px;margin-left: 16px;border:none" @click="changeRuleIndex('up', item, index)" /></div>
              <div><a-button style="flex: 0 0 24px;margin-left: 20px" shape="circle" icon="minus" size="small" @click="deleteRule(item,index)" /></div>
              <div v-if="formData.rules.length > 1 && index !== formData.rules.length - 1"><a-button icon="vertical-align-bottom" style="flex: 0 0 24px;margin-left: 16px;border:none" @click="changeRuleIndex('down', item, index)" /></div>
            </div>
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
        belong_type: [
          { required: true, validator: this.validateBelongType, trigger: 'change' },
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
        limit: 20,
        filter: 'enabled.equals(1)',
      },
      resourceAndTagOptions: [
        {
          id: 1,
          name: this.$t('cloudenv.text_588'),
          value: 'and',
        },
        {
          id: 2,
          name: this.$t('cloudenv.text_587'),
          value: 'or',
        },
        {
          id: 3,
          name: this.$t('cloudenv.match_by_tag_key'),
          value: 'and_copy',
        },
      ],
      projectOptions: [],
      projectDomainId: projectDomainInitialValue,
      tagShow: true,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'userInfo', 'l3PermissionEnable']),
    projectParams () {
      return {
        limit: 20,
        scope: this.$store.getters.scope,
        // project_domain_id: this.projectDomainId,
      }
    },
  },
  mounted () {
  },
  methods: {
    validateBt (index) {
      this.$refs.ruleForm.validateField('rules.' + index + '.belong_type')
    },
    validateBelongType (rule, value, callback) {
      const index = parseInt(rule.field.replace('rules.', '').replace('.belong_type', ''))
      const target = this.formData.rules[index]
      if (value === 'project_id' && !target[value]) {
        callback(new Error(this.$t('common.tips.select', [this.$t('dictionary.project')])))
      }
      if (value === 'project' && !(target[value].trim())) {
        callback(new Error(this.$t('common.tips.input', [this.$t('dictionary.project')])))
      }
      callback()
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
          const ret = {
            condition: item.condition,
            tags: this.getTagValue(item.tags),
          }
          ret[item.belong_type] = (item[item.belong_type] || '').trim()
          return ret
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
        condition: 'and',
        tags: {},
        tag_key: '',
        project_id: undefined,
        project: '',
        belong_type: 'project_id',
      })
    },
    deleteRule (item, idx) {
      this.formData.rules = this.formData.rules.filter((item, index) => index !== idx)
    },
    changeRuleIndex (type, item, idx) {
      const rules = R.clone(this.formData.rules)
      if (type === 'up') {
        [rules[idx - 1], [rules[idx]]] = [rules[idx], [rules[idx - 1]]]
      } else {
        [rules[idx], [rules[idx + 1]]] = [rules[idx + 1], [rules[idx]]]
      }
      this.tagShow = false
      this.formData.rules = rules
      this.$nextTick(() => {
        this.tagShow = true
      })
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
