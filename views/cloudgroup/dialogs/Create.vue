<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('cloudenv.text_492') }}</div>
    <div slot="body">
      <a-form
        :form="form.fc"
         v-bind="formItemLayout">
        <template v-if="isAdminMode">
          <a-form-item :label="`${$t('network.text_205', [$t('dictionary.domain')])}`">
            <base-select
              v-decorator="decorators.project_domain"
              resource="domains"
              version="v1"
              :params="domainProps"
              filterable
              :select-props="{ placeholder: $t('rules.domain') }" />
          </a-form-item>
        </template>
        <a-form-item :label="$t('common.name')">
          <a-input v-decorator="decorators.name" :placeholder="$t('validator.serverCreateName')"  @change="e => { form.fi.generate_name = e.target.value }" />
          <name-repeated
            v-if="form.fi.generate_name"
            res="servers"
            version="v1"
            :name="form.fi.generate_name"
            :params="nameRepeatParams" />
        </a-form-item>
        <a-form-item :label="$t('common.brand')">
          <a-select
            v-decorator="decorators.provider"
            :placeholder="$t('rules.provider')"
            :disabled="!!params.provider"
            @change="handleProviderChange">
            <template v-for="item of providerOptions">
              <a-select-option :key="item[0]" :value="item[1].provider">{{ item[1].label }}</a-select-option>
            </template>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('dictionary.policy')">
          <list-select
            v-decorator="decorators.cloudpolicy_ids"
            :listProps="policySelectProps"
            multiple
            :formatter="row => `${row.name} / ${row.description || ''}`"
            :dialog-params="{ mask: false, width: 900, title: $t('rules.policy') }" />
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
import { mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import NameRepeated from '@/sections/NameRepeated'
import ListSelect from '@/sections/ListSelect'
import { getNameFilter } from '@/utils/common/tableFilter'
import { HYPERVISORS_MAP } from '@/constants'

export default {
  name: 'CloudgroupCreateDialog',
  components: {
    NameRepeated,
    ListSelect,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const providerOptions = Object.entries(HYPERVISORS_MAP).filter(item => {
      return (this.$store.getters.capability.cloud_id_brands || []).includes(item[1].provider) && this.$store.getters.capability.brands.includes(item[1].provider)
    })
    const firstProvider = get(providerOptions, '[0][1].provider')
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
        fi: {
          generate_name: '',
          provider: this.params.provider || firstProvider,
        },
      },
      providerOptions,
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('common.text00042') },
            ],
          },
        ],
        provider: [
          'provider',
          {
            initialValue: this.params.provider || firstProvider,
            rules: [
              { required: true, message: this.$t('rules.provider') },
            ],
          },
        ],
        cloudpolicy_ids: [
          'cloudpolicy_ids',
        ],
        project_domain: [
          'project_domain',
          {
            rules: [
              { required: true, message: this.$t('rules.domain') },
            ],
          },
        ],
      },
      policySelectProps: {
        list: this.$list.createList(this, {
          id: this.id,
          resource: 'cloudpolicies',
          apiVersion: 'v1',
          getParams: () => {
            return {
              scope: this.$store.getters.scope,
              provider: this.form.fc.getFieldValue('provider'),
            }
          },
          filterOptions: {
            name: getNameFilter(),
            description: {
              label: this.$t('table.column.title.desc'),
              filter: true,
              formatter: val => {
                return `description.contains(${val})`
              },
            },
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
    ...mapGetters(['scope', 'isAdminMode']),
    nameRepeatParams () {
      return {
        provider: this.form.fi.provider,
      }
    },
    domainProps () {
      return {
        scope: this.scope,
      }
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
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
    handleProviderChange (val) {
      this.form.fi.provider = val
    },
  },
}
</script>
