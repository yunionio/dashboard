<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ params.formType === 'update' ? $t('helm.text_104') : $t('helm.text_103')}}</div>
    <div slot="body">
      <dialog-selected-tips v-if="params.data" :count="params.data.length" :name="$t('helm.text_6')" :action="$t('helm.text_90')" />
      <dialog-table v-if="params.columns" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        v-bind="formItemLayout"
        :form="form.fc">
        <a-form-item :label="$t('helm.text_16')">
          <a-input v-decorator="decorators.name" :placeholder="$t('helm.text_28')" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_297', [$t('dictionary.domain')])" v-if="$store.getters.isAdminMode">
          <domain-select v-decorator="decorators.project_domain" />
        </a-form-item>
        <a-form-item label="URL">
          <a-input v-decorator="decorators.url" :placeholder="$t('helm.text_91')" />
        </a-form-item>
        <a-form-item :label="$t('helm.text_92')">
          <a-radio-group v-decorator="decorators.type">
            <a-radio-button
              v-for="item in typeOpts"
              :value="item.key"
              :key="item.key">{{ item.label }}</a-radio-button>
          </a-radio-group>
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
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import DomainSelect from '@/sections/DomainSelect'

export default {
  name: 'ChartCreateDialog',
  components: {
    DomainSelect,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const initialValue = {}
    if (this.params.data && this.params.data[0]) {
      initialValue.name = this.params.data[0].name
      initialValue.url = this.params.data[0].url
    }
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
        fd: {},
      },
      typeOpts: [
        { key: 'internal', label: this.$t('helm.text_14') },
        { key: 'external', label: this.$t('helm.text_15') },
      ],
      decorators: {
        name: [
          'name',
          {
            initialValue: initialValue.name,
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('helm.text_28') },
              { validator: this.$validate('k8sName') },
            ],
          },
        ],
        project_domain: [
          'project_domain',
          {
            initialValue: this.$store.getters.userInfo.projectDomainId,
          },
        ],
        type: [
          'type',
          {
            initialValue: 'internal',
          },
        ],
        url: [
          'url',
          {
            initialValue: initialValue.url,
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('helm.text_94'), trigger: 'blur' },
              { validator: this.$validate('url') },
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
  methods: {
    async doCreate (data) {
      try {
        if (this.params.formType === 'update') {
          return await this.params.onManager('update', {
            id: this.params.data[0].id,
            managerArgs: {
              data,
            },
          })
        } else {
          return this.params.onManager('create', {
            managerArgs: {
              data,
            },
          })
        }
      } catch (error) {
        throw error
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.doCreate(values)
        if (this.params.refresh) this.params.refresh()
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
