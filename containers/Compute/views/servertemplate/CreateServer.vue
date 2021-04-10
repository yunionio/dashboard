<template>
  <div class="severtemplate-create-server">
    <page-header :title="$t('compute.text_1039', [this.$t('dictionary.server')])" />
    <a-form :form="form.fc" class="mt-3"  v-bind="formItemLayout">
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
            size="large"
            type="primary"
            class="mr-2"
            @click="submit"
            style="width: 120px;"
            :loading="loading">{{ isOpenWorkflow ? $t('compute.text_288') : $t('dialog.ok') }}</a-button>
          <a-button size="large" style="width: 120px;" @click="goBack">{{$t('compute.text_135')}}</a-button>
          <side-errors :error-title="$t('compute.text_290')" :errors.sync="errors" />
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
      errors: {},
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
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
          this.$message.error(this.$t('compute.text_1044'))
        })
    },
    doCreateWorkflow (values) {
      const params = {
        ...this.serverConfig,
        generate_name: values.generate_name,
        __count__: values.count,
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
          this.$message.success(this.$t('compute.text_1045', [params.generate_name]))
          this.goWorkflow()
        })
    },
    async checkCreateData (fd) {
      try {
        const data = { generate_name: fd.generate_name, ...this.serverConfig }
        const res = new this.$Manager('servers').performAction({ id: 'check-create-data', action: '', data })
        return res
      } catch (error) {
        throw error
      }
    },
    doForecast (fd) {
      const genCreateData = new GenCreateData()
      const params = {
        generate_name: fd.generate_name,
        __count__: fd.count,
        ...this.serverConfig,
      }
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
