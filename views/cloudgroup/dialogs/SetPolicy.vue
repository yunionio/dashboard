<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('cloudenv.cloudgroup_single_action2') }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.cloudgroup')" :count="params.data.length" :action="$t('cloudenv.cloudgroup_single_action2')" />
      <dialog-table class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc"
         v-bind="formItemLayout">
        <a-form-item :label="$t('dictionary.policy')">
          <list-select
            v-decorator="decorators.cloudpolicy_ids"
            :listProps="policySelectProps"
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
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import ListSelect from '@/sections/ListSelect'
import { getNameFilter } from '@/utils/common/tableFilter'

export default {
  name: 'CloudgroupSetPolicyDialog',
  components: {
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
        },
      },
      decorators: {
        cloudpolicy_ids: [
          'cloudpolicy_ids',
          {
            validateFirst: true,
            initialValue: get(this.params.data[0], 'cloudpolicies', []).map(item => item.id),
            rules: [
              { required: true, message: this.$t('common.select') },
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
              provider: this.params.data[0].provider,
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
            title: this.$t('table.title.desc'),
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
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.params.onManager('performAction', {
          steadyStatus: ['available'],
          id: this.params.data[0].id,
          managerArgs: {
            action: 'set-policies',
            data: {
              ...values,
              provider: this.params.data[0].provider,
            },
          },
        })
        if (this.params.success) {
          this.params.success()
        }
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
