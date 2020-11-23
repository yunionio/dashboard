<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('samluser.create_title') }}</div>
    <div slot="body">
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('cloudenv.clouduser_list_t4')" :extra="$t('common_625')">
          <user-select
            v-decorator="decorators.owner_id"
            :cloudaccount-id="params.cloudaccount.id"
            :user.sync="form.fi.user"
            :project.sync="form.fi.project"
            :cloudprovider-id="form.fi.cloudprovider.id" />
        </a-form-item>
        <a-form-item :label="$t('dictionary.cloudgroup')" :extra="$t('samluser.create_cloudgroup_extra')">
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
import * as R from 'ramda'
import UserSelect from '../components/UserSelect'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { getNameFilter } from '@/utils/common/tableFilter'
import ListSelect from '@/sections/ListSelect'

export default {
  name: 'SamluserCreateDialog',
  components: {
    UserSelect,
    ListSelect,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
        fi: {
          user: {},
          cloudprovider: {},
          project: {},
        },
      },
      decorators: {
        owner_id: [
          'owner_id',
          // {
          //   rules: [
          //     { required: true, message: this.$t('common.select') },
          //   ],
          // },
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
              { required: this.params.cloudaccount.brand === 'Google', message: this.$t('common.select') },
            ],
          },
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
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
    }
  },
  computed: {
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
        return { cloudprovider_id: this.form.fi.cloudprovider.id }
      }
      return { cloudaccount_id: this.params.cloudaccount.id }
    },
    nameExtra () {
      if (this.isGoogle) return null
      return this.$t('cloudenv.clouduser_text1')
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const { ...values } = await this.form.fc.validateFields()
        if (!this.isGoogle) {
          values.cloudaccount_id = this.params.cloudaccount.id
        }
        values.project_id = this.form.fi.project.id
        values.project_domain = this.form.fi.user.project_domain
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
  },
}
</script>
