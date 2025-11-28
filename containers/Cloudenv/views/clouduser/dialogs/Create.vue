<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('common.create') }}{{ $t('dictionary.clouduser') }}</div>
    <div slot="body">
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('cloudenv.text_375')" :extra="nameExtra">
          <a-input v-decorator="decorators.generate_name" :placeholder="namePlaceholder"  @change="e => { form.fi.generate_name = e.target.value }" />
          <template v-slot:extra>
            <name-repeated
              res="cloudusers"
              version="v1"
              :name="form.fi.generate_name"
              :params="nameRepeatParams" />
          </template>
        </a-form-item>
        <template>
          <a-form-item :label="$t('dictionary.cloudprovider')">
            <base-select
              v-decorator="decorators.manager_id"
              resource="cloudproviders"
              filterable
              isDefaultSelect
              :params="cloudproviderParams"
              :item.sync="form.fi.cloudprovider" />
          </a-form-item>
        </template>
        <a-form-item :label="$t('cloudenv.clouduser_list_t4')" :extra="$t('common_625')">
          <user-select
            v-decorator="decorators.owner_id"
            :cloudaccount-id="params.cloudaccount.id"
            :user.sync="form.fi.user"
            :project.sync="form.fi.project"
            :cloudprovider-id="form.fi.cloudprovider.id"
            :defaultDomainId="params.defaultDomainId"
            :defaultProjectId="params.defaultProjectId"
            :defaultUserId="params.userId" />
        </a-form-item>
        <a-form-item :label="$t('system.text_146')" class="mb-0" :extra="isEnableMail ? '' : $t('system.is_config_mail_tips')">
          <a-input v-decorator="decorators.email" :disabled="!isEnableMail" :placeholder="$t('system.email_placeholder')" />
        </a-form-item>
        <a-form-item :wrapperCol="{ offset: 4 }">
          <a-checkbox v-decorator="decorators.notify" :disabled="!isCanSendNotify">{{ $t('system.email_checkbox_text') }}</a-checkbox>
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
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import NameRepeated from '@/sections/NameRepeated'
// import ListSelect from '@/sections/ListSelect'
import { getNameFilter } from '@/utils/common/tableFilter'
import UserSelect from '../components/UserSelect'

export default {
  name: 'ClouduserCreateDialog',
  components: {
    NameRepeated,
    UserSelect,
    // ListSelect,
  },
  mixins: [DialogMixin, WindowsMixin],
  props: {
    params: {
      type: Object,
      defualt: () => { },
    },
  },
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            if (values.email && this.isEnableMail) {
              this.$nextTick(() => {
                const isError = this.form.fc.getFieldError('email')
                if (R.isNil(isError) || R.isEmpty(isError)) {
                  this.isCanSendNotify = true
                } else {
                  this.isCanSendNotify = false
                }
              })
            } else {
              this.isCanSendNotify = false
            }
          },
        }),
        fi: {
          generate_name: '',
          user: {},
          cloudprovider: {},
          project: {},
        },
      },
      decorators: {
        generate_name: [
          'generate_name',
          {
            validateFirst: true,
            rules: this.params.cloudaccount.brand === 'Google' ? [
              { required: true, message: this.$t('common.text00042') },
              { validator: this.$validate('email'), message: this.$t('cloudenv.text_376') },
            ] : [],
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
        manager_id: [
          'manager_id',
          {
            rules: [
              { required: true, message: this.$t('common.select') },
            ],
          },
        ],
        cloudgroup_ids: [
          'cloudgroup_ids',
          {
            rules: [
              { required: this.params.cloudaccount.brand === 'Google', message: this.$t('common.select') },
            ],
          },
        ],
        email: [
          'email',
          {
            rules: [
              { validator: this.emailValidator },
            ],
          },
        ],
        notify: [
          'notify',
        ],
      },
      cloudgroupListSelectProps: {
        list: this.$list.createList(this, {
          id: this.id,
          resource: 'cloudgroups',
          apiVersion: 'v1',
          getParams: () => {
            const params = {
              provider: this.params.cloudaccount.provider,
            }
            if (this.$store.getters.isAdminMode) {
              params.domain_id = this.params.cloudaccount.domain_id
            } else {
              params.scope = this.$store.getters.scope
            }
            return params
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
            title: this.$t('cloudenv.text_327'),
            showOverflow: 'title',
          },
          {
            field: 'cloudpolicies',
            title: this.$t('cloudenv.text_329'),
            slots: {
              default: ({ row }) => {
                if (R.isNil(row.cloudpolicies) || R.isEmpty(row.cloudpolicies)) return this.$t('cloudenv.text_330')
                return [<list-body-cell-popover text={this.$t('cloudenv.text_245', [(row.cloudpolicies && row.cloudpolicies.length) || 0])} min-width="600px">
                  <vxe-grid
                    showOverflow={false}
                    row-config={{ isHover: true }}
                    column-config={{ resizable: false }}
                    data={row.cloudpolicies}
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
                    ]} />
                </list-body-cell-popover>]
              },
            },
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
      isCanSendNotify: false,
      isEnableMail: false,
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    cloudproviderParams () {
      return {
        scope: this.$store.getters.scope,
        cloudaccount_id: this.params.cloudaccount.id,
      }
    },
    isGoogle () {
      return this.params.cloudaccount.brand === 'Google'
    },
    namePlaceholder () {
      if (this.form.fi.user && this.form.fi.user.name) {
        if (this.isGoogle) {
          return this.$t('cloudenv.text_377')
        }
        return this.form.fi.user.name
      }
      return ''
    },
    nameRepeatParams () {
      if (this.isGoogle) {
        return { manager_id: this.form.fi.cloudprovider.id }
      }
      return { cloudaccount_id: this.params.cloudaccount.id }
    },
    nameExtra () {
      if (this.isGoogle) return null
      return this.$t('cloudenv.clouduser_text1')
    },
  },
  watch: {
    'form.fi.user': {
      handler (val, oldVal) {
        if (val.id) {
          this.isEnableMail && this.fetchEmail(val.id)
        }
      },
      deep: true,
    },
  },
  created () {
    this.fetchConfigEmail()
  },
  methods: {
    async fetchEmail (userId) {
      const { data } = await new this.$Manager('receivers', 'v1').performClassAction({
        action: 'intellij-get',
        data: {
          scope: this.$store.getters.scope,
          user_id: userId,
        },
      })
      this.form.fc.setFieldsValue({ email: data.email || '' })
    },
    emailValidator (rule, value, callback) {
      if (R.isEmpty(value) || R.isNil(value)) {
        return callback()
      }
      return this.$validate('email')(rule, value, callback)
    },
    async handleConfirm () {
      this.loading = true
      try {
        const { ...values } = await this.form.fc.validateFields()
        if (!this.isGoogle) {
          values.cloudaccount_id = this.params.cloudaccount.id
        }
        values.project_id = this.form.fi.project.id
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
    async fetchConfigEmail () {
      this.isEnableMail = false
      try {
        const res = await new this.$Manager('notifyconfigs/capability', 'v1').list({})
        const domainData = res.data.domain || {}
        const systemData = res.data.system || []
        if (domainData[this.userInfo.projectDomainId] && domainData[this.userInfo.projectDomainId].includes('email')) {
          this.isEnableMail = true
          return
        }
        if (systemData.includes('email')) {
          this.isEnableMail = true
        }
      } catch (error) {
        throw error
      } finally {
        this.$emit('update:loading', false)
      }
    },
  },
}
</script>
