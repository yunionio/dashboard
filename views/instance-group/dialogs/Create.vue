<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">新建主机组</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item :label="`指定${$t('dictionary.project')}`" class="mb-0" v-bind="formItemLayout">
          <domain-project :fc="form.fc" :decorators="{ project: decorators.project, domain: decorators.domain }" />
        </a-form-item>
        <a-form-item label="名称" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceName')" />
        </a-form-item>
        <a-form-item label="策略" v-bind="formItemLayout" :extra="forceDispersionExtra">
          <a-radio-group v-decorator="decorators.force_dispersion">
            <a-radio-button :value="true">强制</a-radio-button>
            <a-radio-button :value="false">非强制</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="粒度" v-bind="formItemLayout" extra="该组内虚拟机可以在同一宿主机存在的数量（范围 1 ~ 10 台）">
          <a-input-number :min="1" :max="10" :parser="Math.round" v-decorator="decorators.granularity" />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { isRequired } from '@/utils/validate'
import i18n from '@/locales'
import DomainProject from '@/sections/DomainProject'

export default {
  name: 'InstanceGroupCreateDialog',
  components: {
    DomainProject,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            if (values.hasOwnProperty('force_dispersion')) {
              this.form.fd.force_dispersion = values.force_dispersion
            }
          },
        }),
        fd: {
          force_dispersion: true,
        },
      },
      decorators: {
        domain: [
          'domain',
          {
            rules: [
              { validator: isRequired(), message: i18n.t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        project: [
          'project',
          {
            rules: [
              { validator: isRequired(), message: i18n.t('rules.project'), trigger: 'change' },
            ],
          },
        ],
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请输入名称' },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        force_dispersion: [
          'force_dispersion',
          {
            initialValue: true,
          },
        ],
        granularity: [
          'granularity',
          {
            initialValue: 1,
            validateFirst: true,
            rules: [
              { required: true, message: '请输入粒度' },
              { type: 'number', min: 1, max: 10, message: '范围为 1 ~ 10' },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    forceDispersionExtra () {
      let s = '组内主机严格根据粒度要求分布在不同宿主机，当没有更多宿主机时，则创建失败'
      if (!this.form.fd.force_dispersion) {
        s = '组内主机尽可能根据粒度要求分布在不同宿主机，当没有更多宿主机时，可以重复'
      }
      return s
    },
  },
  methods: {
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
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        const { project, domain, ...rest } = values
        await this.params.onManager('create', {
          managerArgs: {
            data: {
              ...rest,
              project_domain: (domain && domain.key) || this.userInfo.projectDomainId,
              project_id: (project && project.key) || this.userInfo.projectId,
            },
          },
        })
        this.loading = false
        this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
