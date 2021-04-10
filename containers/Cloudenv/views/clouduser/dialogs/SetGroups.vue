<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('cloudenv.clouduser_list_a1') }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.clouduser')" :count="params.data.length" :action="$t('cloudenv.clouduser_list_a1')" />
      <dialog-table class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
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
import * as R from 'ramda'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import ListSelect from '@/sections/ListSelect'
import { getNameFilter } from '@/utils/common/tableFilter'

export default {
  name: 'ClouduserSetGroupsDialog',
  components: {
    ListSelect,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        cloudgroup_ids: [
          'cloudgroup_ids',
          {
            initialValue: this.params.data[0].cloudgroups && this.params.data[0].cloudgroups.map(item => item.id),
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
            title: this.$t('table.title.name'),
            showOverflow: 'title',
            sortable: true,
          },
          {
            field: 'description',
            title: this.$t('table.title.desc'),
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
        // expandConfig: {
        //   lazy: true,
        //   loadMethod: async ({ row }) => {
        //     let manager = new this.$Manager('cloudpolicies', 'v1')
        //     try {
        //       const response = await manager.list({
        //         params: {
        //           cloudgroup_id: row.id,
        //           scope: this.$store.getters.scope,
        //         },
        //       })
        //       row.feCloudpolicies = response.data.data || []
        //       return response
        //     } catch (error) {
        //       throw error
        //     } finally {
        //       manager = null
        //     }
        //   },
        //   // visibleMethod: ({ row }) => {
        //   //   return row.cloudpolicies && row.cloudpolicies.length > 0
        //   // },
        // },
      },
    }
  },
  methods: {
    formatterLabel (row) {
      return row.description ? `${row.name} / ${row.description}` : row.name
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.params.onManager('performAction', {
          id: this.params.data[0].id,
          steadyStatus: 'available',
          managerArgs: {
            action: 'set-groups',
            data: values,
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
