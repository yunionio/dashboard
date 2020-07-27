<template>
  <div>
    <page-header :title="$t('helm.text_25')" />
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
            <div class="mt-1" style="font-size: 12px; color: #555; font-weight: 500;">{{ isVm ? $t('helm.text_26') : $t('helm.text_27') }}</div>
          </page-card-detail>
          <a-form
            v-bind="formItemLayout"
            :form="form.fc">
            <a-form-item :label="$t('helm.text_16')">
              <a-input v-decorator="decorators.release_name" :placeholder="$t('helm.text_28')" />
            </a-form-item>
            <a-form-item :label="$t('helm.text_29')">
              <a-select v-decorator="decorators.version" :placeholder="$t('helm.text_30')">
                <a-select-option
                  v-for="item in versions"
                  :key="item.key"
                  :value="item.key">
                  {{ item.label }}
                </a-select-option>
              </a-select>
            </a-form-item>
            <template v-if="isVm">
              <a-form-item :label="$t('helm.text_24', [$t('dictionary.project')])">
                <domain-project :fc="form.fc" :decorators="{ project: decorators.project, domain: decorators.domain }" />
              </a-form-item>
            </template>
            <template v-else>
              <a-form-item :label="$t('helm.text_31')">
                <cluster-select v-decorator="decorators.cluster" @input="setCluster" />
              </a-form-item>
              <a-form-item :label="$t('helm.text_32')">
                <namespace-select v-decorator="decorators.namespace"  @input="setNamespace" :cluster="cluster" :namespaceObj.sync="namespaceObj" />
              </a-form-item>
            </template>
            <form-yaml
              :decorators="decorators"
              :activeTab.sync="formActiveTab"
              :localData="chartDetail.chart.values"
              :valueSearch="valueSearch" />
          </a-form>
          <a-collapse v-model="activeKey">
            <a-collapse-panel v-if="chartDetail.yaml !== ''" :header="$t('helm.text_33')" key="desc">
              <div v-html="compiledMarkdown" />
            </a-collapse-panel>
            <a-collapse-panel :header="$t('helm.text_34')" key="yaml">
              <template-preview :previewFiles="previewFiles" />
            </a-collapse-panel>
          </a-collapse>
        </template>
      </div>
    </page-body>
    <page-footer>
      <div slot="right">
        <a-button class="mr-3" type="primary" @click="confirm" :loading="loading">{{$t('helm.text_35')}}</a-button>
        <a-button @click="cancel">{{$t('helm.text_36')}}</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import _ from 'lodash'
import * as R from 'ramda'
import marked from 'marked'
import { Base64 } from 'js-base64'
import FormYaml from './FormYaml'
import ClusterSelect from '@K8S/sections/ClusterSelect'
import NamespaceSelect from '@K8S/sections/NamespaceSelect'
import TemplatePreview from '@K8S/sections/TemplatePreview'
import k8sCreateMixin from '@K8S/mixins/create'
import { validateYaml, isRequired } from '@/utils/validate'
import DomainProject from '@/sections/DomainProject'

export default {
  name: 'K8SChartCreate',
  components: {
    FormYaml,
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
          return _callback(this.$t('helm.text_37'))
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
      decorators: {
        release_name: [
          'release_name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('helm.text_28') },
              { min: 2, max: 24, message: this.$t('helm.text_38'), trigger: 'blur' },
              { validator: this.$validate('k8sName') },
            ],
          },
        ],
        version: [
          'version',
          {
            rules: [
              { required: true, message: this.$t('helm.text_30'), trigger: 'blur' },
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
              { required: true, message: this.$t('helm.text_39'), trigger: 'blur' },
            ],
          },
        ],
        namespace: [
          'namespace',
          {
            initialValue: this.$store.state.common.k8s.namespace,
            rules: [
              { required: true, message: this.$t('helm.text_40'), trigger: 'blur' },
            ],
          },
        ],
        config: {
          key: i => [
            `keys[${i}]`,
            {
              rules: [
                { required: true, message: this.$t('helm.text_41') },
              ],
            },
          ],
          value: i => [
            `values[${i}]`,
            {
              rules: [
                { required: true, message: this.$t('helm.text_42') },
              ],
            },
          ],
        },
        yaml: [
          'yaml',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('helm.text_43') },
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
        const opts = []
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
        this.$message.error(this.$t('helm.text_44'))
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
    async doCreate (values) {
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
        this.$message.success(this.$t('helm.text_45'))
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
