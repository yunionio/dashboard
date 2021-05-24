<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('cloudenv.text_583')}}</div>
    <div slot="body">
      <a-form
        v-bind="formLayout"
        :form="form.fc">
        <div v-for="(item) in form.fc.getFieldValue('rules')" :key="item.id" :value="item.id">
          <!-- 匹配条件 -->
          <a-form-item :label="$t('cloudenv.text_22')" v-bind="formLayout">
            <a-select default-value="or" v-decorator="[
              `matchs[${item}]`,
              {
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
                    validator: tagsLengthValidate,
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
        </div>
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
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
export default {
  name: 'ProjectMappingRuleCreateDialog',
  components: {
    Tag,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const projectDomainInitialValue = this.params.projectDomainId || this.$store.getters.userInfo.projectDomainId
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
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
        accounts: [
          'accounts',
          {
            rules: [
              { required: true, message: this.$t('cloudenv.text_284', [this.$t('cloudenv.text_589')]) },
            ],
          },
        ],
      },
      formLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
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
          this.fetchProject()
        }
      },
      immediate: true,
    },
  },
  created () {
    // this.fetchs()
  },
  mounted () {
    this.form.fc.getFieldDecorator('rules', { initialValue: [], preserve: true })
    this.form.fc.setFieldsValue({
      rules: [0],
    })
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
        this.accountOptions = cloudAccounts.map(item => {
          return {
            id: item.id,
            name: item.name,
            brand: this.$t('dashboard.text_98') + ': ' + item.brand,
          }
        })
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
    doUpdate (data) {
      return new this.$Manager('project_mappings').update({ id: this.params.id, data: data })
    },
    doBind ({ accountIds, ProjectMappingId }) {
      const manager = new this.$Manager('cloudaccounts')
      return manager.batchPerformAction({
        ids: accountIds,
        action: 'project-mapping',
        data: { cloudaccount: { ProjectMappingId } },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        // 获取参数
        const params = this.getUpdateParams(values)
        const updateResult = await this.doUpdate(params)
        this.cancelDialog()
        this.params.success && this.params.success(updateResult)
        this.$message.success(this.$t('common.success'))
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    getUpdateParams ({ accounts, project_domain_id, name, rules, tags, matchs, maps }) {
      let newRules = rules.map(item => {
        if (tags[item] && matchs[item] && maps[item]) {
          return {
            condition: matchs[item],
            project_id: maps[item],
            tags: this.getTagValue(tags[item]),
          }
        }
      })
      if (this.params.rules) {
        newRules = newRules.concat(this.params.rules)
      }
      return {
        rules: newRules,
      }
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
    tagsLengthValidate (rule, value, callback) {
      const keys = Object.keys(value)
      if (keys.length > 20) {
        // eslint-disable-next-line
        callback(false)
      } else {
        callback()
      }
    },
  },
}
</script>
