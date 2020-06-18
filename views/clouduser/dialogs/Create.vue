<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ this.$t('common.create') }}{{ this.$t('dictionary.clouduser') }}</div>
    <div slot="body">
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('cloudenv.clouduser_list_t4')">
          <user-select
            v-decorator="decorators.owner_id"
            :cloudaccount-id="params.cloudaccount.id"
            :user.sync="form.fi.user" />
        </a-form-item>
        <template v-if="isGoogle">
          <a-form-item :label="$t('dictionary.cloudprovider')">
            <base-select
              v-decorator="decorators.cloudprovider_id"
              resource="cloudproviders"
              filterable
              :params="cloudproviderParams"
              :item.sync="form.fi.cloudprovider" />
          </a-form-item>
        </template>
        <a-form-item :label="$t('common.name')" :extra="$t('cloudenv.clouduser_text1')">
          <a-input v-decorator="decorators.generate_name" :placeholder="namePlaceholder"  @change="e => { form.fi.generate_name = e.target.value }" />
          <name-repeated
            v-slot:extra
            res="cloudusers"
            version="v1"
            :name="form.fi.generate_name"
            :params="nameRepeatParams" />
        </a-form-item>
        <a-form-item :label="$t('dictionary.cloudgroup')" :extra="$t('cloudenv.clouduser_text2')">
          <list-select
            v-decorator="decorators.cloudgroup_ids"
            :listProps="cloudgroupListSelectProps"
            :formatter="formatterLabel"
            :dialog-params="{ mask: false }" />
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
import UserSelect from '../components/UserSelect'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import NameRepeated from '@/sections/NameRepeated'
import ListSelect from '@/sections/ListSelect'
import { getNameFilter } from '@/utils/common/tableFilter'

export default {
  name: 'ClouduserCreateDialog',
  components: {
    NameRepeated,
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
          generate_name: '',
          user: {},
          cloudprovider: {},
        },
      },
      decorators: {
        generate_name: [
          'generate_name',
          {
            validateFirst: true,
            rules: this.params.cloudaccount.brand === 'Google' ? [
              { required: true, message: this.$t('common.text00042') },
              { validator: this.$validate('email'), message: '请输入正确名称' },
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
        cloudprovider_id: [
          'cloudprovider_id',
          {
            rules: [
              { required: true, message: this.$t('common.select') },
            ],
          },
        ],
        cloudgroup_ids: [
          'cloudgroup_ids',
        ],
      },
      cloudgroupListSelectProps: {
        list: this.$list.createList(this, {
          id: this.id,
          resource: 'cloudgroups',
          apiVersion: 'v1',
          getParams: () => {
            return {
              scope: this.$store.getters.scope,
              provider: this.params.cloudaccount.provider,
            }
          },
          filterOptions: {
            name: getNameFilter(),
          },
        }),
        columns: [
          {
            field: 'name',
            title: this.$t('table.column.title.name'),
            showOverflow: 'title',
          },
          {
            field: 'description',
            title: this.$t('table.column.title.desc'),
            showOverflow: 'title',
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
      return this.isGoogle ? this.$t('validator.serverCreateName') : this.form.fi.user.name
    },
    nameRepeatParams () {
      if (this.isGoogle) {
        return { cloudprovider_id: this.form.fi.cloudprovider.id }
      }
      return { cloudaccount_id: this.params.cloudaccount.id }
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
