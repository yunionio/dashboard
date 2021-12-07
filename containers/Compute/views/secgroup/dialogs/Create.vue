<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_189')}}</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('compute.text_297', [$t('dictionary.project')])" v-bind="formItemLayout" class="mb-0">
          <domain-project :fc="form.fc" :form-layout="formItemLayout" :decorators="{ project: decorators.project, domain: decorators.domain }" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_1016')" v-bind="formItemLayout">
          <a-select
            v-decorator="decorators.template"
            @change="handleSelectChange">
            <a-select-option v-for="(v, k) in templateOps" :key="k" :value="k">
              {{v}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('compute.text_228')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" :placeholder="$t('compute.text_210')" />
        </a-form-item>
        <a-form-item :label="$t('common.description')" v-bind="formItemLayout">
          <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_1154')" class="mb-0" v-bind="formItemLayout">
          <tag
            v-decorator="decorators.tag" />
        </a-form-item>
      </a-form>
      <a-tabs defaultActiveKey="in" @change="tabCallback">
        <a-tab-pane :tab="$t('compute.text_993')" key="in">
          <a-table
          :columns="columns"
          :dataSource="ruleData[templateType]['in']"
          :pagination="false" />
        </a-tab-pane>
        <a-tab-pane :tab="$t('compute.text_994')" key="out" forceRender>
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
import validateForm, { isRequired } from '@/utils/validate'
import Tag from '@/sections/Tag'

export default {
  name: 'CreateSecgroupDialog',
  components: {
    DomainProject,
    Tag,
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
              { required: true, message: this.$t('compute.text_333') },
              { validator: this.$validate('templateName') },
            ],
          },
        ],
        description: ['description'],
        tag: [
          'tag',
          {
            initialValue: {},
            rules: [
              { required: true, message: this.$t('cloudenv.text_451') },
              { validator: validateForm('tagName') },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      templateOps: {
        1: this.$t('compute.text_1010'),
        2: this.$t('compute.text_1011'),
        3: this.$t('compute.text_144'),
      },
      columns: [
        {
          dataIndex: 'cidr',
          title: this.$t('compute.text_979'),
          width: 100,
        },
        {
          dataIndex: 'protocol',
          title: this.$t('compute.text_1017'),
          width: 150,
        },
        {
          dataIndex: 'ports',
          title: this.$t('compute.text_349'),
          width: 100,
        },
        {
          dataIndex: 'action',
          title: this.$t('compute.text_694'),
          width: 100,
        },
        {
          dataIndex: 'description',
          title: this.$t('compute.text_312'),
        },
      ],
      ruleData: {
        1: {
          in: [
            {
              cidr: '0.0.0.0/0',
              protocol: 'TCP',
              ports: '80',
              action: this.$t('compute.text_976'),
              description: this.$t('compute.text_1006'),
            },
            {
              cidr: '0.0.0.0/0',
              protocol: 'TCP',
              ports: '443',
              action: this.$t('compute.text_976'),
              description: this.$t('compute.text_1007'),
            },
            {
              cidr: '0.0.0.0/0',
              protocol: 'TCP',
              ports: '3389',
              action: this.$t('compute.text_976'),
              description: this.$t('compute.text_1004'),
            },
            {
              cidr: '0.0.0.0/0',
              protocol: 'TCP',
              ports: '22',
              action: this.$t('compute.text_976'),
              description: this.$t('compute.text_1005'),
            },
            {
              cidr: '0.0.0.0/0',
              protocol: 'ICMP',
              ports: 'ALL',
              action: this.$t('compute.text_976'),
              description: this.$t('compute.text_1008'),
            },
          ],
          out: [
            {
              cidr: '0.0.0.0/0',
              protocol: 'ALL',
              ports: 'ALL',
              action: this.$t('compute.text_976'),
              description: '',
            },
          ],
        },
        2: {
          in: [
            {
              cidr: '0.0.0.0/0',
              protocol: 'ALL',
              ports: 'ALL',
              action: this.$t('compute.text_976'),
              description: this.$t('compute.text_1018'),
            },
          ],
          out: [
            {
              cidr: '0.0.0.0/0',
              protocol: 'ALL',
              ports: 'ALL',
              action: this.$t('compute.text_976'),
              description: '',
            },
          ],
        },
        3: {
          in: [
            {
              action: '',
              cidr: '',
              ports: '',
              protocol: '',
              description: this.$t('compute.text_1019'),
            },
          ],
          out: [],
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
        const rules = []
        const key = this.templateType || '1'
        if (key && key !== '3' && this.ruleData[key]) {
          Object.keys(this.ruleData[key]).forEach(k => {
            const items = this.ruleData[key][k]
            for (let i = 0; i < items.length; i++) {
              const obj = { ...items[i] }
              if (obj.protocol === 'ALL') {
                obj.protocol = 'any'
              }
              if (obj.protocol === 'ALL') {
                obj.protocol = 'any'
              }
              obj.priority = items.length - i
              obj.action = 'allow'
              obj.direction = k
              obj.protocol = obj.protocol.toLowerCase()
              if (obj.ports === 'ALL') {
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
          __meta__: values.tag,
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
