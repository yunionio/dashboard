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
            :description="chartDetail.chart.metadata.description" />
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
            <a-form-item label="集群">
              <cluster-select v-decorator="decorators.cluster" @input="setCluster" />
            </a-form-item>
            <a-form-item label="命名空间">
              <namespace-select v-decorator="decorators.namespace"  @input="setNamespace" :cluster="cluster" :namespaceObj.sync="namespaceObj" />
            </a-form-item>
            <form-yaml
              :decorators="decorators"
              :activeTab.sync="formActiveTab"
              :localData="chartDetail.chart.values"
              :valueSearch="valueSearch" />
          </a-form>
          <a-collapse v-model="activeKey">
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
import ClusterSelect from '@K8S/sections/ClusterSelect'
import NamespaceSelect from '@K8S/sections/NamespaceSelect'
import TemplatePreview from '@K8S/sections/TemplatePreview'
import k8sCreateMixin from '@K8S/mixins/create'
import FormYaml from './FormYaml'
import { validateYaml } from '@/utils/validate'

export default {
  name: 'K8SChartCreate',
  components: {
    FormYaml,
    ClusterSelect,
    NamespaceSelect,
    TemplatePreview,
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
      activeKey: ['desc', 'yaml'],
      formActiveTab: 'form',
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
    }
  },
  computed: {
    compiledMarkdown () {
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
    valueSearch (query, path) {
      const values = this.chartDetail.chart.values
      const value = _.get(values, path)
      if (value && (R.is(String, value) || R.is(Number, value))) {
        let opts = []
        if (!query || (value === query || (query && value.toLowerCase().includes(query.toLowerCase())))) opts.push(value)
        return opts
      }
      return []
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
          label: `${v.repo}-${v.version}`,
          key: `${v.repo}-${v.version}`,
        }
      })
      this.form.fc.setFieldsValue({
        [this.decorators.version[0]]: this.versions[0].key,
      })
    },
    async doCreate (values) {
      const data = {
        chart_name: `${this.chartDetail.repo}/${this.chartDetail.name}`,
        release_name: values.release_name,
        cluster: values.cluster,
        namespace: values.namespace,
      }
      if (!R.isNil(values.version) && !R.isEmpty(values.version)) {
        data.version = values.version.split('-')[1]
      }
      const sets = {}
      if (this.formActiveTab === 'form') {
        R.forEachObjIndexed((value, key) => {
          sets[value] = values.values[key]
        }, values.keys)
        data.sets = sets
      } else {
        data.values = values.yaml
      }
      await this.releaseM.create({ data })
    },
    async confirm () {
      try {
        this.loading = true
        const values = await this.form.fc.validateFields()
        await this.doCreate(values)
        this.$message.success('操作成功')
        this.loading = false
        this.cancel()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    cancel () {
      this.$router.push('/k8s-release')
    },
  },
}
</script>
