<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">新建</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item :label="`指定${$t('dictionary.project')}`" v-bind="formItemLayout" class="mb-0">
          <domain-project :fc="form.fc" :form-layout="formItemLayout" :decorators="{ project: decorators.project, domain: decorators.domain }" />
        </a-form-item>
        <a-form-item label="模版" v-bind="formItemLayout">
          <a-select
            v-decorator="decorators.template"
            @change="handleSelectChange">
            <a-select-option v-for="(v, k) in templateOps" :key="k" :value="k">
              {{v}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="名称" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" placeholder="请输入名称" />
        </a-form-item>
      </a-form>
      <a-tabs defaultActiveKey="in" @change="tabCallback">
        <a-tab-pane tab="入方向" key="in">
          <a-table
          :columns="columns"
          :dataSource="ruleData[templateType]['in']"
          :pagination="false" />
        </a-tab-pane>
        <a-tab-pane tab="出方向" key="out" forceRender>
          <a-table
          :columns="columns"
          :dataSource="ruleData[templateType]['out']"
          :pagination="false" />
        </a-tab-pane>
      </a-tabs>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import DomainProject from '@/sections/DomainProject'
import { isRequired } from '@/utils/validate'

export default {
  name: 'CreateSecgroupDialog',
  components: {
    DomainProject,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const tenant = this.params.extParams && this.params.extParams.tenant
    const domain = this.params.extParams && this.params.extParams.domain
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        domain: [
          'domain',
          {
            initialValue: domain || this.$store.getters.userInfo.projectDomainId,
            rules: [
              { validator: isRequired(), message: this.$t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        project: [
          'project',
          {
            initialValue: tenant || this.$store.getters.userInfo.projectId,
            rules: [
              { validator: isRequired(), message: this.$t('rules.project'), trigger: 'change' },
            ],
          },
        ],
        template: [
          'template',
          {
            initialValue: '1',
          },
        ],
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请填写名称' },
              { validator: this.$validate('templateName') },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 22,
        },
        labelCol: {
          span: 2,
        },
      },
      templateOps: {
        '1': '通用Web服务器',
        '2': '开放全部端口',
        '3': '自定义',
      },
      columns: [
        {
          dataIndex: 'cidr',
          title: '来源',
          width: 100,
        },
        {
          dataIndex: 'protocol',
          title: '协议类型',
          width: 150,
        },
        {
          dataIndex: 'ports',
          title: '端口',
          width: 100,
        },
        {
          dataIndex: 'action',
          title: '策略',
          width: 100,
        },
        {
          dataIndex: 'description',
          title: '备注',
        },
      ],
      ruleData: {
        '1': {
          'in': [
            {
              cidr: '0.0.0.0/0',
              protocol: 'TCP',
              ports: '80',
              action: '允许',
              description: 'Web服务端口（http）',
            },
            {
              cidr: '0.0.0.0/0',
              protocol: 'TCP',
              ports: '443',
              action: '允许',
              description: 'Web服务端口（https）',
            },
            {
              cidr: '0.0.0.0/0',
              protocol: 'TCP',
              ports: '3389',
              action: '允许',
              description: 'Windows远程登录',
            },
            {
              cidr: '0.0.0.0/0',
              protocol: 'TCP',
              ports: '22',
              action: '允许',
              description: 'Linux SSH登录',
            },
            {
              cidr: '0.0.0.0/0',
              protocol: 'ICMP',
              ports: 'ALL',
              action: '允许',
              description: 'Ping服务',
            },
          ],
          'out': [
            {
              cidr: '0.0.0.0/0',
              protocol: 'ALL',
              ports: 'ALL',
              action: '允许',
              description: '',
            },
          ],
        },
        '2': {
          'in': [
            {
              cidr: '0.0.0.0/0',
              protocol: 'ALL',
              ports: 'ALL',
              action: '允许',
              description: '开放全部端口有一定安全风险，请谨慎选择',
            },
          ],
          'out': [
            {
              cidr: '0.0.0.0/0',
              protocol: 'ALL',
              ports: 'ALL',
              action: '允许',
              description: '',
            },
          ],
        },
        '3': {
          'in': [
            {
              action: '',
              cidr: '',
              ports: '',
              protocol: '',
              description: '入方向不放通任何端口，您可在安全组创建后，根据实际访问需求添加或修改安全组规则',
            },
          ],
          'out': [],
        },
      },
      templateType: 1,
      checkedTab: 'in',
    }
  },
  methods: {
    handleSelectChange (e) {
      this.templateType = e
    },
    tabCallback (e) {
      this.checkedTab = e
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    doCreate (data) {
      return new this.$Manager('secgroups').create({ data: data })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        this.loading = true
        let rules = []
        const key = this.templateType || '1'
        if (key && key !== '3' && this.ruleData[key]) {
          Object.keys(this.ruleData[key]).forEach(k => {
            const items = this.ruleData[key][k]
            for (let i = 0; i < items.length; i++) {
              const obj = { ...items[i] }
              if (obj['protocol'] === 'ALL') {
                obj['protocol'] = 'any'
              }
              if (obj['protocol'] === 'ALL') {
                obj['protocol'] = 'any'
              }
              obj['priority'] = items.length - i
              obj['action'] = 'allow'
              obj['direction'] = k
              obj['protocol'] = obj['protocol'].toLowerCase()
              if (obj['ports'] === 'ALL') {
                delete obj.ports
              }
              rules.push(obj)
            }
          })
        }
        const newValues = {
          name: values.name,
          rules,
          tenant: values.project && values.project.key,
        }
        await this.doCreate(newValues)
        this.loading = false
        this.cancelDialog()
        this.params.refresh && this.params.refresh()
        this.params.success && this.params.success()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
