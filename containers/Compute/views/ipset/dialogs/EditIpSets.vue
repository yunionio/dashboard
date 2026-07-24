<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ dialogTitle }}</div>
    <div slot="body">
      <a-form
        v-bind="formItemLayout"
        :form="form.fc">
        <a-form-item v-if="!isEdit" :label="$t('compute.text_297', [$t('dictionary.project')])" class="mb-0">
          <domain-project
            :fc="form.fc"
            :form-layout="formItemLayout"
            :decorators="{ project: decorators.project, domain: decorators.domain }" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_228')" class="mb-0">
          <a-input :placeholder="$t('validator.resourceName')" v-decorator="decorators.name" />
        </a-form-item>
        <a-form-item :label="$t('common.description')" class="mb-0">
          <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" :placeholder="$t('common_367')" v-decorator="decorators.description" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_175')" class="mb-0">
          <a-radio-group v-decorator="decorators.ip_set_type" @change="ipsetTypeChange" :disabled="isEdit">
            <a-radio value="ipv4_cidr_list">IPv4</a-radio>
            <a-radio value="ipv6_cidr_list">IPv6</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="decLabel" :extra="$t('compute.secgroup.secrule.source.prompt')" class="mb-0">
          <a-textarea
            :auto-size="{ minRows: 3, maxRows: 10 }"
            v-decorator="decorators.data"
            :placeholder="$t('compute.text_996')" />
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
import { isRequired, REGEXP } from '@/utils/validate'
import DomainProject from '@/sections/DomainProject'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'EditIpSetsDialog',
  components: {
    DomainProject,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const selectItem = (this.params.data && this.params.data[0]) || {}
    const ipsetType = selectItem.ipset_type || 'ipv4_cidr_list'
    const dataValue = Array.isArray(selectItem.data)
      ? selectItem.data.join(',')
      : (selectItem.data || '')
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
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
        name: [
          'name',
          {
            initialValue: selectItem.name,
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('compute.text_210') },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        description: [
          'description',
          {
            initialValue: selectItem.description || '',
          },
        ],
        ip_set_type: [
          'ip_set_type',
          {
            initialValue: ipsetType,
          },
        ],
        data: [
          'data',
          {
            initialValue: dataValue,
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('compute.text_996') },
              { validator: this.validateCIDR },
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
      ipsetType,
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    isEdit () {
      return this.params.title === 'edit'
    },
    dialogTitle () {
      if (this.isEdit) {
        return `${this.$t('compute.text_982')}${this.$t('compute.title.ipset')}`
      }
      return `${this.$t('compute.perform_create')}${this.$t('compute.title.ipset')}`
    },
    decLabel () {
      return this.ipsetType === 'ipv6_cidr_list' ? 'IPv6 CIDR' : 'IPv4 CIDR'
    },
  },
  methods: {
    ipsetTypeChange (e) {
      this.ipsetType = e.target.value
      this.form.fc.validateFields(['data'])
    },
    parseDataList (value) {
      if (!value) return []
      if (Array.isArray(value)) {
        return value.map(item => String(item).trim()).filter(Boolean)
      }
      return String(value).split(/[,\n]/).map(item => item.trim()).filter(Boolean)
    },
    validateCIDR (rule, value, callback) {
      if (!value) {
        return callback()
      }
      const items = this.parseDataList(value)
      const isIpv6 = this.ipsetType === 'ipv6_cidr_list'
      for (const item of items) {
        if (isIpv6) {
          if (!REGEXP.IPv6.regexp.test(item) && !REGEXP.cidr6.regexp.test(item)) {
            return callback(new Error(this.$t('common.tips.input', ['IPv6/CIDR'])))
          }
        } else if (!REGEXP.IPv4.regexp.test(item) && !REGEXP.cidr.regexp.test(item)) {
          return callback(new Error(this.$t('common.tips.input', ['IPv4/CIDR'])))
        }
      }
      return callback()
    },
    genData (values) {
      const { project, domain, data, ...rest } = values
      const payload = {
        ...rest,
        data: this.parseDataList(data).join(','),
      }
      if (!this.isEdit) {
        payload.project_domain = (domain && domain.key) || this.userInfo.projectDomainId
        payload.project_id = (project && project.key) || this.userInfo.projectId
      }
      return payload
    },
    doCreate (data) {
      return this.params.onManager('create', {
        managerArgs: { data },
      })
    },
    doUpdate (data) {
      return this.params.onManager('update', {
        id: this.params.data[0].id,
        managerArgs: { data },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const payload = this.genData(values)
        if (this.isEdit) {
          await this.doUpdate(payload)
        } else {
          await this.doCreate(payload)
        }
        this.params.refresh && this.params.refresh()
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
