<template>
  <div>
    <page-header title="部署发布(Release)" />
    <page-body>
      <div>
        <template v-if="!chartDetail.name">
          <loading-block :layout="loadingLayout" />
        </template>
        <template v-else>
          <page-card-detail
            class="mt-3 mb-4"
            :img="chartDetail.chart.metadata.icon"
            :page-title="chartDetail.name"
            :description="chartDetail.chart.metadata.description">
            <div class="mt-1" style="font-size: 12px; color: #555; font-weight: 500;">{{ isVm ? '虚拟机应用' : '容器应用' }}</div>
          </page-card-detail>
          <a-form
            v-bind="formItemLayout"
            :form="form.fc">
            <a-form-item label="名称">
              <a-input v-decorator="decorators.release_name" placeholder="请输入名称" />
            </a-form-item>
            <a-form-item label="商店-模板版本">
              <a-select v-decorator="decorators.version" placeholder="请选择版本">
                <a-select-option
                  v-for="item in versions"
                  :key="item.key"
                  :value="item.key">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <template v-if="isVm">
              <a-form-item :label="`资源归属${$t('dictionary.project')}`">
                <domain-project :fc="form.fc" :decorators="{ project: decorators.project, domain: decorators.domain }" />
              </a-form-item>
            </template>
            <template v-else>
              <a-form-item label="集群">
                <cluster-select v-decorator="decorators.cluster" @input="setCluster" />
              </a-form-item>
              <a-form-item label="命名空间">
                <namespace-select v-decorator="decorators.namespace"  @input="setNamespace" :cluster="cluster" :namespaceObj.sync="namespaceObj" />
              </a-form-item>
            </template>
          </a-form>
          <a-collapse v-model="activeKey">
            <a-collapse-panel header="表单配置" key="jsonschema">
              <json-schema-form v-if="isJsonSchema" :schema="schema" :definition="definition" :hide-reset="false" ref="formRef" />
              <form-yaml
                v-else
                :decorators="decorators"
                :activeTab.sync="formActiveTab"
                :localData="chartDetail.chart.values"
                :valueSearch="valueSearch" />
            </a-collapse-panel>
            <a-collapse-panel v-if="chartDetail.yaml !== ''" header="详细描述" key="desc">
              <div v-html="compiledMarkdown" />
            </a-collapse-panel>
            <a-collapse-panel header="YAML模板" key="yaml">
              <template-preview :previewFiles="previewFiles" />
            </a-collapse-panel>
          </a-collapse>
        </template>
      </div>
    </page-body>
    <page-footer>
      <div slot="right">
        <a-button class="mr-3" type="primary" @click="confirm" :loading="loading">确 定</a-button>
        <a-button @click="cancel">取 消</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import _ from 'lodash'
import * as R from 'ramda'
import marked from 'marked'
import { Base64 } from 'js-base64'
import { compactObj, handleJsonSchemaProperties } from '@/utils/utils'
import ClusterSelect from '@K8S/sections/ClusterSelect'
import NamespaceSelect from '@K8S/sections/NamespaceSelect'
import TemplatePreview from '@K8S/sections/TemplatePreview'
import k8sCreateMixin from '@K8S/mixins/create'
import DomainProject from '@/sections/DomainProject'
import { validateYaml, isRequired } from '@/utils/validate'
import { HYPERVISORS_MAP } from '@/constants'

export default {
  name: 'K8SChartCreate',
  components: {
    ClusterSelect,
    NamespaceSelect,
    TemplatePreview,
    DomainProject,
  },
  mixins: [k8sCreateMixin],
  data () {
    const validator = (rule, value, _callback) => {
      validateYaml(value)
        .then(() => {
          return _callback()
        })
        .catch(() => {
          return _callback('请输入正确的yaml地址')
        })
    }
    return {
      activeKey: ['jsonschema', 'desc', 'yaml'],
      formActiveTab: 'form',
      isJsonSchema: false,
      versions: [],
      previewFiles: [],
      loading: false,
      chartDetail: {
        readme: '',
        chart: {},
      },
      namespaceObj: {},
      formItemLayout: {
        labelCol: { span: 4 },
        wrapperCol: { span: 20 },
      },
      isVm: this.$route.query.type === 'internal',
      loadingLayout: [
        [10],
        [8, 9],
        [2, 4, 7, 5],
        [13, 9],
        [4, 3, 8],
        [8, 6, 8],
        [13, 9],
      ],
      form: {
        fc: this.$form.createForm(this),
      },
      schema: {},
      decorators: {
        release_name: [
          'release_name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请输入名称' },
              { min: 2, max: 24, message: '长度在 2 到 24 个字符', trigger: 'blur' },
              { validator: this.$validate('k8sName') },
            ],
          },
        ],
        version: [
          'version',
          {
            rules: [
              { required: true, message: '请选择版本', trigger: 'blur' },
            ],
          },
        ],
        domain: [
          'domain',
          {
            rules: [
              { validator: isRequired(), message: this.$t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        project: [
          'project',
          {
            rules: [
              { validator: isRequired(), message: this.$t('rules.project'), trigger: 'change' },
            ],
          },
        ],
        cluster: [
          'cluster',
          {
            initialValue: this.$store.state.common.k8s.cluster,
            rules: [
              { required: true, message: '请选择集群', trigger: 'blur' },
            ],
          },
        ],
        namespace: [
          'namespace',
          {
            initialValue: this.$store.state.common.k8s.namespace,
            rules: [
              { required: true, message: '请选择命名空间', trigger: 'blur' },
            ],
          },
        ],
        config: {
          key: i => [
            `keys[${i}]`,
            {
              rules: [
                { required: true, message: '请输入，例如：image或者image.pullSecrets' },
              ],
            },
          ],
          value: i => [
            `values[${i}]`,
            {
              rules: [
                { required: true, message: '请输入值' },
              ],
            },
          ],
        },
        yaml: [
          'yaml',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请输入Yaml' },
              { validator },
            ],
          },
        ],
      },
      definition: [],
    }
  },
  computed: {
    compiledMarkdown () {
      if (!this.chartDetail.readme) return '暂无描述'
      const markdownDoc = Base64.decode(this.chartDetail.readme)
      return marked(markdownDoc, { sanitize: true })
    },
  },
  created () {
    this.chartsM = new this.$Manager('charts', 'v1')
    this.releaseM = new this.$Manager('releases', 'v1')
    this.getChart()
    this.getChartVersion()
  },
  methods: {
    async getCapability () {
      if (!this.definition || !this.definition.length) return
      try {
        const { data: { data } } = await new this.$Manager('capabilities', 'v2').list({ params: {} })
        if (data && data.length) {
          const index = this.definition.findIndex(val => {
            if (R.is(Object, val)) {
              return val.key === 'hypervisor'
            }
            return val === 'hypervisor'
          })
          const { hypervisors = [] } = data[0]
          const hyperItem = this.definition[index]
          const hyperObj = R.is(Object, hyperItem) ? hyperItem : { key: hyperItem }
          this.definition.splice(index, 1, {
            ...hyperObj,
            type: 'a-select',
            options: hypervisors.map(v => ({ value: v, label: (_.get(HYPERVISORS_MAP, `${v}.label`) || v) })),
          })
        }
      } catch (error) {
        throw error
      }
    },
    getDefinition (jsonshcema = this.schema) {
      const _getDefinition = (key, value) => {
        const item = key
        if (key === 'project') return
        this.definition.push(item)
      }
      handleJsonSchemaProperties(jsonshcema, _getDefinition)
      this.getCapability()
    },
    valueSearch (query, path) {
      const values = this.chartDetail.chart.values
      const value = _.get(values, path)
      if (value && (R.is(String, value) || R.is(Number, value))) {
        const opts = []
        if (!query || (value === query || (query && value.toLowerCase().includes(query.toLowerCase())))) opts.push(value)
        return opts
      }
      return []
    },
    async validateForm () {
      try {
        const values = await this.$refs.formRef.handleSubmit()
        const validData = compactObj(values) // 去除 属性值是 undefined，''和null的
        return validData
      } catch (error) {
        throw error
      }
    },
    async getChart () {
      const { repo, name } = this.$route.query
      const { data } = await this.chartsM.get({
        id: name,
        params: {
          repo,
        },
      })
      if (data) {
        this.chartDetail = data
        this.previewFiles = data.files
        if (this.activeKey.indexOf('yaml')) {
          this.activeKey.push('yaml')
        }
        const jsonSchemaItem = data.files.find(val => val.name.endsWith('values.schema.json'))
        if (R.is(Object, jsonSchemaItem)) {
          let schema = Base64.decode(jsonSchemaItem.data)
          if (R.is(String, schema)) {
            schema = JSON.parse(schema)
          }
          this.schema = schema
          this.getDefinition()
          this.isJsonSchema = true
        }
      }
    },
    async getChartVersion () {
      this.versionLoading = true
      const { repo, name } = this.$route.query
      const { data: { data = [] } } = await this.chartsM.list({
        params: {
          repo,
          name,
          all_version: true,
        },
      })
      if (data.length === 0) {
        this.$message.error('该应用模板目前无可用版本，请联系管理员')
        return
      }
      this.versions = data.map(v => {
        return {
          label: `${v.repo} - ${v.version}`,
          key: `${v.repo} - ${v.version}`,
        }
      })
      this.form.fc.getFieldDecorator(this.decorators.version[0], this.decorators.version[1])
      this.form.fc.setFieldsValue({
        [this.decorators.version[0]]: this.versions[0].key,
      })
    },
    async doCreate (values, valuesJson) {
      const data = {
        chart_name: `${this.chartDetail.repo}/${this.chartDetail.name}`,
        release_name: values.release_name,
      }
      if (this.isVm) {
        if (this.$store.getters.isAdminMode) {
          data.domain = values.domain.key
          data.project = values.project.key
        }
        if (this.$store.getters.isDomainMode) {
          data.project = values.project.key
          data.domain = this.$store.getters.userInfo.projectDomainId
        }
        if (this.$store.getters.isProjectMode) {
          data.domain = this.$store.getters.userInfo.projectDomainId
          data.project = this.$store.getters.userInfo.projectId
        }
      } else {
        data.cluster = values.cluster
        data.namespace = values.namespace
      }
      if (!R.isNil(values.version) && !R.isEmpty(values.version)) {
        data.version = values.version.split(' - ')[1]
      }
      if (valuesJson) {
        data.values_json = valuesJson
      } else {
        const sets = {}
        if (this.formActiveTab === 'form') {
          R.forEachObjIndexed((value, key) => {
            sets[value] = values.values[key]
          }, values.keys)
          data.sets = sets
        } else {
          data.values = values.yaml
        }
      }
      await this.releaseM.create({ data })
    },
    async confirm () {
      this.loading = true
      const jobs = [this.form.fc.validateFields()]
      if (this.isJsonSchema) {
        jobs.push(this.validateForm())
      }
      try {
        const [values, valuesJson] = await Promise.all(jobs)
        console.log(values, valuesJson, 'values, valuesJson')
        await this.doCreate(values, valuesJson)
        this.$message.success('操作成功')
        this.loading = false
        this.cancel(true)
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    cancel (isSuccess) {
      if (isSuccess) {
        if (this.isVm) {
          this.$router.push('/vm-release')
        } else {
          this.$router.push('/k8s-release')
        }
      } else {
        this.$router.push('/k8s-chart')
      }
    },
  },
}
</script>
