<template>
  <div class="severtemplate-create-server">
    <page-header :title="`新建${this.$t('dictionary.server')}`" />
    <a-form :form="form.fc" class="mt-3" v-bind="formItemLayout">
      <a-form-item label="名称" extra="名称支持序号占位符‘#’，用法如下。 名称：host## 数量：2、实例为：host01、host02">
        <a-input v-decorator="decorators.generate_name" :placeholder="$t('validator.serverCreateName')" />
      </a-form-item>
      <a-form-item label="数量">
        <a-input-number v-decorator="decorators.count" :min="1" :max="100" />
      </a-form-item>
      <a-form-item label="申请原因" v-if="isOpenWorkflow">
        <a-input v-decorator="decorators.reason" placeholder="请输入主机申请原因" />
      </a-form-item>
      <page-footer>
        <template v-slot:right>
          <a-button
            size="large"
            type="primary"
            class="mr-2"
            @click="submit"
            style="width: 120px;"
            :loading="loading">{{ isOpenWorkflow ? '提交工单' : $t('dialog.ok') }}</a-button>
          <a-button size="large" style="width: 120px;" @click="goBack">取消</a-button>
          <side-errors error-title="创建主机失败" :errors.sync="errors" />
        </template>
      </page-footer>
    </a-form>
  </div>
</template>

<script>
import { GenCreateData } from '@Compute/utils/createServer'
import WindowsMixin from '@/mixins/windows'
import workflowMixin from '@/mixins/workflow'
import { WORKFLOW_TYPES } from '@/constants/workflow'
import SideErrors from '@/sections/SideErrors'

export default {
  name: 'ServertemplateCreateServer',
  components: {
    SideErrors,
  },
  mixins: [WindowsMixin, workflowMixin],
  data () {
    return {
      loading: false,
      catalogData: {},
      serverConfig: null,
      errors: [],
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        generate_name: [
          'generate_name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请输入主机名称' },
              { validator: this.$validate('serverCreateName') },
            ],
          },
        ],
        count: [
          'count',
          {
            initialValue: 1,
            validateFirst: true,
            rules: [
              { required: true, message: '请输入数量' },
            ],
          },
        ],
        reason: [
          'reason',
        ],
      },
      formItemLayout: {
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
      },
    }
  },
  computed: {
    isOpenWorkflow () {
      return this.checkWorkflowEnabled(WORKFLOW_TYPES.APPLY_MACHINE)
    },
  },
  created () {
    this.fetchServerConfig()
  },
  methods: {
    fetchServerConfig (id) {
      new this.$Manager('servertemplates', 'v2')
        .get({ id: this.$route.query.id })
        .then(({ data }) => {
          this.serverConfig = data.content
        })
        .catch(() => {
          this.$message.error('获取主机模板数据失败，无法完成部署')
        })
    },
    doCreateWorkflow (values) {
      const params = {
        ...this.serverConfig,
        generate_name: values.generate_name,
      }
      delete params.reason
      const variables = {
        process_definition_key: WORKFLOW_TYPES.APPLY_MACHINE,
        initiator: this.$store.getters.userInfo.id,
        description: values.reason,
        'server-create-paramter': JSON.stringify(params),
        project: values.project_id,
      }
      // this._getProjectDomainInfo(variables) // !!! project_domain 暂时不加，因为后端可以从token里面获取
      return new this.$Manager('process-instances', 'v1')
        .create({ data: { variables } })
        .then(() => {
          this.$message.success(`主机 ${params.generate_name} 创建请求流程已提交`)
          this.goWorkflow()
        })
    },
    doForecast (fd) {
      const genCreateData = new GenCreateData()
      const params = { generate_name: fd.generate_name, ...this.serverConfig }
      return new this.$Manager('schedulers', 'v1').rpc({ methodname: 'DoForecast', params })
        .then(res => {
          if (res.data.can_create) {
            this.createServer(params)
          } else {
            this.errors = genCreateData.getForecastErrors(res.data)
          }
        })
        .catch(err => {
          this.$message.error(`创建失败: ${err}`)
        })
    },
    createServer (data) {
      delete data['vcpu_count']
      delete data['vmem_size']
      new this.$Manager('servers', 'v2').create({ data })
        .then(res => {
          this.$message.success('操作成功，开始创建')
          this.goVminstance()
        })
    },
    async submit () {
      this.loading = true
      try {
        let values = await this.form.fc.validateFields()
        if (this.isOpenWorkflow) {
          await this.doCreateWorkflow(values)
        } else {
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

<style lang="scss" scoped>
.severtemplate-create-server {
  ::v-deep .ant-form.ant-form-horizontal .ant-form-item .ant-form-item-label{
    padding-left: 20px;
  }
}
</style>
