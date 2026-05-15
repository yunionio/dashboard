<template>
  <div class="severtemplate-create-server">
    <page-header :title="$t('compute.text_1039', [this.$t('dictionary.server')])" />
    <div v-if="fetchError" class="mt-3 px-3">
      <a-button @click="goBack">{{ $t('compute.text_135') }}</a-button>
    </div>
    <a-spin v-else :spinning="!decoratorsReady">
      <a-form v-if="decoratorsReady" :form="form.fc" class="mt-3" v-bind="formItemLayout">
        <a-form-item :label="$t('compute.text_297', [$t('dictionary.project')])">
          <domain-project
            :fc="form.fc"
            :fd="formFd"
            :decorators="{ project: decorators.project, domain: decorators.domain }"
            :restrict-domain-id="templateDomainFilterId"
            :ignore-storage="true" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_228')" :extra="$t('compute.text_1040')">
          <a-input v-decorator="decorators.generate_name" :placeholder="$t('validator.resourceCreateName')" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_294')">
          <a-input-number v-decorator="decorators.count" :min="1" :max="100" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_1041')" v-if="isOpenWorkflow">
          <a-input v-decorator="decorators.reason" :placeholder="$t('compute.text_1042')" />
        </a-form-item>
        <page-footer>
          <template v-slot:right>
            <a-button
              type="primary"
              class="mr-2"
              @click="submit"
              style="width: 120px;"
              :loading="loading">{{ isOpenWorkflow ? $t('compute.text_288') : $t('dialog.ok') }}</a-button>
            <a-button style="width: 120px;" @click="goBack">{{$t('compute.text_135')}}</a-button>
            <side-errors :error-title="$t('compute.text_290')" :errors.sync="errors" />
          </template>
        </page-footer>
      </a-form>
    </a-spin>
  </div>
</template>

<script>
import { GenCreateData, Decorator } from '@Compute/utils/createServer'
import { SERVER_TYPE } from '@Compute/constants'
import DomainProject from '@/sections/DomainProject'
import WindowsMixin from '@/mixins/windows'
import workflowMixin from '@/mixins/workflow'
import { WORKFLOW_TYPES } from '@/constants/workflow'
import SideErrors from '@/sections/SideErrors'

export default {
  name: 'ServertemplateCreateServer',
  components: {
    SideErrors,
    DomainProject,
  },
  mixins: [WindowsMixin, workflowMixin],
  data () {
    return {
      loading: false,
      fetchError: false,
      catalogData: {},
      serverConfig: null,
      project_id: '',
      project_domain: '',
      templateProjectId: '',
      /** 用于域下拉接口过滤，与模板数据中的域一致 */
      templateDomainFilterId: '',
      decoratorsReady: false,
      errors: {},
      formFd: {},
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {},
    }
  },
  computed: {
    isOpenWorkflow () {
      return this.checkWorkflowEnabled(WORKFLOW_TYPES.APPLY_MACHINE)
    },
    formItemLayout () {
      return {
        wrapperCol: {
          md: { span: 18 },
          xl: { span: 21 },
          xxl: { span: 22 },
        },
        labelCol: {
          md: { span: 6 },
          xl: { span: 3 },
          xxl: { span: 2 },
        },
      }
    },
  },
  created () {
    this.fetchServerConfig()
  },
  methods: {
    makeBaseDecorators () {
      return {
        generate_name: [
          'generate_name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('compute.text_1043') },
              { validator: this.$validate('resourceCreateName') },
            ],
          },
        ],
        count: [
          'count',
          {
            initialValue: 1,
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('compute.text_211') },
            ],
          },
        ],
        reason: [
          'reason',
        ],
      }
    },
    applyTemplateDecorators (content, tenantId, projectDomain) {
      const init = {
        ...(content || {}),
        project_id: tenantId,
        extraData: {
          ...(content?.extraData || {}),
          domain_id: projectDomain || content?.extraData?.domain_id,
        },
      }
      const d = new Decorator(SERVER_TYPE.idc).createDecorators(init)
      this.decorators = {
        ...this.makeBaseDecorators(),
        domain: d.domain,
        project: d.project,
      }
    },
    fetchServerConfig () {
      new this.$Manager('servertemplates', 'v2')
        .get({ id: this.$route.query.id })
        .then(({ data }) => {
          this.serverConfig = data.content
          this.project_id = data.tenant_id
          this.project_domain = data.project_domain
          this.templateProjectId = data.tenant_id
          this.templateDomainFilterId = data.project_domain || data.content?.extraData?.domain_id || ''
          this.applyTemplateDecorators(data.content, data.tenant_id, data.project_domain)
          this.decoratorsReady = true
        })
        .catch(() => {
          this.$message.error(this.$t('compute.text_1044'))
          this.fetchError = true
        })
    },
    /** 名称、数量覆盖模板；域、项目以表单为准写入请求体（与 GenCreateData 一致） */
    buildCreateParams (values) {
      const base = {
        ...this.serverConfig,
        generate_name: values.generate_name,
        __count__: values.count,
      }
      const proj = values.project
      const dom = values.domain
      if (proj && proj.key) {
        base.project_id = proj.key
      }
      if (dom && dom.key) {
        base.extraData = { ...(base.extraData || {}), domain_id: dom.key }
      }
      return base
    },
    doCreateWorkflow (values) {
      const params = this.buildCreateParams(values)
      delete params.reason
      const variables = {
        process_definition_key: WORKFLOW_TYPES.APPLY_MACHINE,
        initiator: this.$store.getters.userInfo.id,
        description: values.reason,
        'server-create-paramter': JSON.stringify(params),
        project: (values.project && values.project.key) || this.project_id,
        project_domain: (values.domain && values.domain.key) || this.project_domain,
      }
      return new this.$Manager('process-instances', 'v1')
        .create({ data: { variables } })
        .then(() => {
          this.$message.success(this.$t('compute.text_1045', [params.generate_name]))
          this.goWorkflow()
        })
    },
    async checkCreateData (fd) {
      try {
        const data = { ...this.buildCreateParams(fd), dry_run: true }
        const res = new this.$Manager('servers').create({ data })
        return res
      } catch (error) {
        throw error
      }
    },
    doForecast (fd) {
      const genCreateData = new GenCreateData()
      const params = this.buildCreateParams(fd)
      return new this.$Manager('schedulers', 'v1').rpc({ methodname: 'DoForecast', params })
        .then(res => {
          if (res.data.can_create) {
            this.createServer(params)
          } else {
            this.errors = genCreateData.getForecastErrors(res.data)
          }
        })
        .catch(err => {
          this.$message.error(this.$t('compute.text_321', [err]))
        })
    },
    createServer (data) {
      delete data.vcpu_count
      delete data.vmem_size
      new this.$Manager('servers', 'v2').create({ data })
        .then(res => {
          this.$message.success(this.$t('compute.text_322'))
          this.goVminstance()
        })
    },
    async submit () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        if (this.isOpenWorkflow) {
          await this.doCreateWorkflow(values)
        } else {
          await this.checkCreateData(values)
          await this.doForecast(values)
        }
        this.loading = false
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    goWorkflow () {
      this.$router.push('/workflow')
    },
    goBack () {
      this.$router.push('/servertemplate')
    },
    goVminstance () {
      this.$router.push('/vminstance')
    },
  },
}
</script>

<style lang="less" scoped>
.severtemplate-create-server {
  ::v-deep .ant-form.ant-form-horizontal .ant-form-item .ant-form-item-label{
    padding-left: 20px;
  }
}
</style>
