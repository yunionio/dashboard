<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('user.create_samluser') }}</div>
    <div slot="body">
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('cloudenv.clouduser_list_t4')">
          <span>{{ params.user.name }}</span>
        </a-form-item>
        <a-form-item :label="$t('dictionary.project')">
          <base-select
            v-decorator="decorators.project_id"
            filterable
            :item.sync="form.fi.project"
            :options="projects">
            <template #optionTemplate="{ options }">
              <a-select-option v-for="item in options" :key="item.id" :value="item.id">
                {{ item.name }}<span class="text-color-secondary ml-2">{{ $t('common_624', [$t('dictionary.domain')]) }}: </span>{{ item.project_domain }}
              </a-select-option>
            </template>
          </base-select>
        </a-form-item>
        <a-form-item :label="$t('dictionary.cloudaccount')">
          <a-row :gutter="8">
            <a-col :span="12">
              <a-select v-model="form.fi.provider">
                <template v-for="item of providerOptions">
                  <a-select-option :key="item[0]" :value="item[1].provider">
                    <span class="text-color-secondary">{{ $t('common.brand') }}: </span>{{ item[1].label }}
                  </a-select-option>
                </template>
              </a-select>
            </a-col>
            <a-col :span="12">
              <base-select
                v-decorator="decorators.cloudaccount_id"
                resource="cloudaccounts"
                filterable
                :item.sync="form.fi.cloudaccount"
                :params="cloudaccountParams"
                :mapper="cloudaccountMapper">
                <template #optionTemplate="{ options }">
                  <a-select-option v-for="item in options" :key="item.id" :value="item.id">
                    <span class="text-color-secondary">{{ $t('dictionary.cloudaccount') }}: </span>{{ item.name }}
                  </a-select-option>
                </template>
              </base-select>
            </a-col>
          </a-row>
        </a-form-item>
        <template v-if="isGoogle">
          <a-form-item :label="$t('dictionary.cloudprovider')">
            <base-select
              v-decorator="decorators.cloudprovider_id"
              resource="cloudproviders"
              filterable
              :params="cloudproviderParams" />
          </a-form-item>
        </template>
        <a-form-item :label="$t('dictionary.cloudgroup')" :extra="$t('cloudenv.clouduser_text2')">
          <list-select
            v-decorator="decorators.cloudgroup_id"
            :listProps="cloudgroupListSelectProps"
            :formatter="formatterLabel"
            :dialog-params="{ mask: false }"
            :multiple="false" />
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
import get from 'lodash/get'
import * as R from 'ramda'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import ListSelect from '@/sections/ListSelect'
import { getNameFilter } from '@/utils/common/tableFilter'
import { HYPERVISORS_MAP } from '@/constants'

export default {
  name: 'SamluserCreateForUserDialog',
  components: {
    ListSelect,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const providerOptions = Object.entries(HYPERVISORS_MAP).filter(item => {
      return (this.$store.getters.capability.saml_auth_brands || []).includes(item[1].provider) && this.$store.getters.capability.brands.includes(item[1].provider)
    })
    const firstProvider = get(providerOptions, '[0][1].provider')
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
        fi: {
          provider: firstProvider,
          cloudaccount: {},
          project: {},
        },
      },
      projects: [],
      decorators: {
        project_id: [
          'project_id',
          {
            rules: [
              { required: true, message: this.$t('common.select') },
            ],
          },
        ],
        owner_id: [
          'owner_id',
          {
            rules: [
              { required: true, message: this.$t('common.select') },
            ],
          },
        ],
        cloudaccount_id: [
          'cloudaccount_id',
          {
            rules: [
              { required: true, message: this.$t('common.select') },
            ],
          },
        ],
        cloudprovider_id: [
          'cloudprovider_id',
          {
            rules: [
              { required: true, message: this.$t('common.select') },
            ],
          },
        ],
        cloudgroup_id: [
          'cloudgroup_id',
          {
            rules: [
              { required: true, message: this.$t('common.select') },
              // { required: firstProvider === 'Google', message: this.$t('common.select') },
            ],
          },
        ],
      },
      providerOptions,
      cloudgroupListSelectProps: {
        list: this.$list.createList(this, {
          id: this.id,
          resource: 'cloudgroups',
          apiVersion: 'v1',
          getParams: () => {
            return {
              scope: this.$store.getters.scope,
              provider: this.form.fi.provider,
            }
          },
          filterOptions: {
            name: getNameFilter(),
          },
        }),
        columns: [
          {
            field: 'name',
            title: this.$t('table.title.name'),
            showOverflow: 'title',
          },
          {
            field: 'description',
            title: this.$t('system.text_193'),
            showOverflow: 'title',
          },
          {
            field: 'cloudpolicies',
            title: this.$t('cloudenv.text_329'),
            type: 'expand',
            slots: {
              default: ({ row }) => {
                return [this.$t('cloudenv.text_245', [(row.cloudpolicies && row.cloudpolicies.length) || 0])]
              },
              content: ({ row }) => {
                if (R.isNil(row.cloudpolicies) || R.isEmpty(row.cloudpolicies)) return this.$t('cloudenv.text_330')
                return [
                  <vxe-grid
                    showOverflow='title'
                    data={ row.cloudpolicies }
                    columns={[
                      {
                        field: 'name',
                        title: this.$t('common.name'),
                      },
                      {
                        field: 'description',
                        title: this.$t('table.title.desc'),
                        formatter: ({ cellValue }) => cellValue || '-',
                      },
                    ]} />,
                ]
              },
            },
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 19,
        },
        labelCol: {
          span: 5,
        },
      },
    }
  },
  computed: {
    cloudaccountParams () {
      const params = {
        scope: this.$store.getters.scope,
        provider: this.form.fi.provider,
        enabled: true,
        health_status: 'normal',
        status: 'connected',
        tenant_id: this.form.fi.project.id,
      }
      if (this.$store.getters.isAdminMode) {
        params.project_domain = this.form.fi.project.domain_id
      }
      if (this.$store.getters.isDomainMode) {
        params.project_domains = [this.form.fi.project.domain_id]
      }
      return params
    },
    cloudproviderParams () {
      return {
        scope: this.$store.getters.scope,
        cloudaccount_id: this.form.fi.cloudaccount.id || '',
        tenant_id: this.form.fi.project.id,
      }
    },
    isGoogle () {
      return this.form.fi.provider === 'Google'
    },
    namePlaceholder () {
      return this.isGoogle ? this.$t('system.text_496') : this.params.user.name
    },
    nameExtra () {
      return this.isGoogle ? null : this.$t('cloudenv.clouduser_text1')
    },
  },
  watch: {
    isGoogle (val) {
      this.decorators.generate_name[1].rules = val ? [
        { required: true, message: this.$t('common.text00042') },
        { validator: this.$validate('email'), message: this.$t('system.text_497') },
      ] : []
      if (val) {
        this.decorators.cloudgroup_id[1].rules[0].required = true
      } else {
        this.decorators.cloudgroup_id[1].rules[0].required = false
      }
      this.form.fc.resetFields(['generate_name', 'cloudgroup_id'])
    },
    'form.fi.cloudaccount.provider' (val) {
      this.form.fc.resetFields(['cloudgroup_id', 'cloudprovider_id'])
    },
    'form.fi.project.id' (val) {
      this.form.fc.resetFields(['cloudgroup_id', 'cloudprovider_id'])
    },
  },
  destroyed () {
    this.um = null
  },
  created () {
    this.um = new this.$Manager('users', 'v1')
    this.fetchProjects()
  },
  methods: {
    async fetchProjects () {
      try {
        const response = await this.um.getSpecific({
          id: this.params.user.id,
          spec: 'projects',
          params: {
            scope: this.$store.getters.scope,
          },
        })
        this.projects = response.data.data || []
        this.form.fc.setFieldsValue({
          project_id: this.projects[0].id,
        })
      } catch (error) {
        throw error
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        const { ...values } = await this.form.fc.validateFields()
        values.owner_id = this.params.user.id
        values.project_domain = this.form.fi.project.project_domain
        await this.params.onManager('create', {
          managerArgs: {
            data: values,
          },
        })
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
    formatterLabel (row) {
      return row.description ? `${row.name} / ${row.description}` : row.name
    },
    cloudaccountMapper (data) {
      let _data = [...data]
      _data = _data.filter(item => {
        if (this.form.fi.provider !== 'Google' && item.share_mode === 'provider_domain' && item.project_domain !== this.form.fi.project.project_domain) {
          return false
        }
        return true
      })
      return _data
    },
  },
}
</script>
