<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('cloudenv.text_604')}}</div>
    <div slot="body">
      <a-form-model ref="ruleForm" :model="formData" :rules="rules" v-bind="layout">
        <!-- 条件 -->
        <a-form-model-item :label="$t('cloudenv.text_22')" v-bind="layout" :rules="rules.condition" prop="condition">
          <a-select v-model="formData.condition">
            <a-select-option v-for="item in resourceAndTagOptions" :value="item.value" :key="item.value" :disabled="item.value === 'and_copy' && isSecAndcopy()">
              {{item.name}}
            </a-select-option>
          </a-select>
        </a-form-model-item>
        <!-- 标签key -->
        <template v-if="formData.condition === 'and_copy'">
          <a-form-model-item :label="$t('cloudenv.tag_key')" v-bind="layout" :rules="rules.tag_key" prop="tag_key">
            <a-input v-model="formData.tag_key" />
          </a-form-model-item>
        </template>
        <template v-else>
          <!-- 标签 -->
          <a-form-model-item :label="$t('cloudenv.text_16')" v-bind="layout" :rules="rules.tags" prop="tags">
            <tag :defaultChecked="formData.defaultTags" @change="handleTagChange" />
          </a-form-model-item>
          <!-- 项目 -->
          <a-form-model-item :label="$t('cloudenv.belong_type')" :extra="formData.belong_type === 'project_id' ? $t('cloudenv.text_592') : $t('cloudenv.belong_project_name_tip')" v-bind="layout" :rules="rules.belong_type" prop="belong_type">
              <a-form-model-item class="mb-0">
                <a-radio-group v-model="formData.belong_type" @change="validateBt">
                  <a-radio-button value="project_id">{{ $t('cloudenv.target_project') }}</a-radio-button>
                  <a-radio-button value="project">{{ $t('cloudenv.target_name') }}</a-radio-button>
                </a-radio-group>
                <base-select
                  v-if="formData.belong_type === 'project_id'"
                  resource="projects"
                  remote
                  :params="projectParams"
                  v-model="formData.project_id"
                  :select-props="{placeholder: $t('common.tips.select', [$t('dictionary.project')])}"
                  @change="validateBt" />
                <a-input v-else type="text" v-model="formData.project" :placeholder="$t('common.tips.select', [$t('dictionary.project')])" @change="validateBt" />
              </a-form-model-item>
          </a-form-model-item>
        </template>
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
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import Tag from '../components/Tag'
export default {
  name: 'ProjectMappingRuleEditDialog',
  components: {
    Tag,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const { editType } = this.params
    const projectDomainInitialValue = this.params.projectDomainId || this.$store.getters.userInfo.projectDomainId
    let initFormData = {
      condition: 'and',
      tags: {},
      tag_key: '',
      project_id: '',
      belong_type: 'project_id',
      project: '',
    }
    if (editType === 'edit') {
      const data = this.params.data[0]
      const initCondition = data.condition === 'and' && !data.hasOwnProperty('project_id') && !data.hasOwnProperty('project') ? 'and_copy' : data.condition
      const initBelongType = data.hasOwnProperty('project_id') ? 'project_id' : 'project'
      const tags = this.initTags(data.tags)
      if (initCondition === 'and_copy') {
        initFormData = { condition: initCondition, tag_key: data.tags[0]?.key }
      } else {
        initFormData = { condition: data.condition, tags: tags, defaultTags: R.clone(tags), project_id: data.project_id, project: data.project, belong_type: initBelongType }
      }
    }
    return {
      loading: false,
      formData: initFormData,
      rules: {
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
      },
      layout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
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
      projectDomainId: projectDomainInitialValue,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'isDomainMode', 'userInfo', 'l3PermissionEnable']),
    projectParams () {
      return {
        scope: this.scope,
        // project_domain_id: this.params.projectDomainId,
        limit: 20,
      }
    },
    editIndex () {
      const { data, rules } = this.params
      let idx = rules.length
      rules.map((item, index) => {
        if (item._XID === data[0]._XID) {
          idx = index
        }
      })
      return idx
    },
  },
  methods: {
    validateBt () {
      this.$refs.ruleForm.validateField('belong_type')
    },
    validateBelongType (rule, value, callback) {
      if (value === 'project_id' && !this.formData[value]) {
        callback(new Error(this.$t('common.tips.select', [this.$t('dictionary.project')])))
      }
      if (value === 'project' && !((this.formData[value] || '').trim())) {
        callback(new Error(this.$t('common.tips.input', [this.$t('dictionary.project')])))
      }
      callback()
    },
    initTags (tagArr = []) {
      const tags = {}
      tagArr.map(item => {
        const key = 'user:' + item.key
        if (!tags[key]) {
          tags[key] = []
        }
        tags[key].push(item.value)
      })
      return tags
    },
    handleTagChange (val) {
      console.log('tag change', val)
      this.formData.tags = val
    },
    isSecAndcopy () {
      const { editType, rules } = this.params
      const index = editType === 'create' ? rules.length : this.editIndex
      let has = false
      rules.map((item, idx) => {
        if (item.condition === 'and' && !item.hasOwnProperty('project_id') && !item.hasOwnProperty('project') && index !== idx) {
          has = true
        }
      })
      return has
    },
    getUpdateParams () {
      const { rules, editType } = this.params
      const ruleList = rules.map(item => {
        const ret = { condition: item.condition, tags: item.tags, auto_create_project: item.auto_create_project }
        if (item.project_id) {
          ret.project_id = item.project_id
          ret.project = item.project
        } else if (ret.project) {
          ret.project = item.project
        }
        return ret
      })
      let newRule = {}
      if (this.formData.condition === 'and_copy') {
        newRule = {
          condition: 'and',
          tags: [{ key: this.formData.tag_key }],
          auto_create_project: true,
        }
      } else {
        newRule = {
          condition: this.formData.condition,
          tags: this.getTagValue(this.formData.tags),
        }
        newRule[this.formData.belong_type] = this.formData[this.formData.belong_type]
      }
      if (editType === 'create') {
        return [...ruleList, newRule]
      } else if (editType === 'edit') {
        return ruleList.map((item, index) => {
          if (index === this.editIndex) {
            return newRule
          }
          return item
        })
      }
      return ruleList
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
    doUpdate (data) {
      return new this.$Manager('project_mappings').update({ id: this.params.id, data: data })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const validate = await this.$refs.ruleForm.validate()
        if (!validate) return
        // 获取参数
        const rules = this.getUpdateParams()
        await this.doUpdate({ rules })
        this.cancelDialog()
        this.$bus.$emit('ProjectMappingRuleUpdate')
        this.$message.success(this.$t('common.success'))
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
