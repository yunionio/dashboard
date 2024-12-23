<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="this.params.title" :name="$t('dictionary.blockstorage')" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form :form="form.fc" v-bind="formItemLayout">
         <a-form-item :label="$t('storage.text_60')" v-if="params.data[0].brand.toLowerCase() !== 'zstack'">
          <a-input-number :step="0.1" v-decorator="decorators.commit_bound" :min="0" />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { formItemLayout, MEDIUM_TYPES } from '@Storage/constants/index.js'
import { getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'BlockStorageUpdateCommitBoundDialog',
  components: {},
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      MEDIUM_TYPES,
      loading: false,
      formItemLayout,
      form: {
        fc: this.$form.createForm(this),
      },
      columns: [
        getCopyWithContentTableColumn(),
        {
          field: 'commit_bound',
          title: this.$t('storage.text_60'),
          formatter: ({ row }) => {
            return row.commit_bound ? row.commit_bound.toFixed(1) : '-'
          },
        },
        {
          field: 'medium_type',
          title: this.$t('storage.text_39'),
          formatter: ({ row }) => {
            return MEDIUM_TYPES[row.medium_type] || row.medium_type
          },
        },
      ],
    }
  },
  provide () {
    return {
      form: this.form,
    }
  },
  computed: {
    decorators () {
      return {
        commit_bound: [
          'commit_bound',
          {
            initialValue: this.params.data[0].commit_bound || 1,
            rules: [
              { required: true, message: this.$t('storage.text_61') },
            ],
          },
        ],
        medium_type: [
          'medium_type',
          {
            initialValue: this.params.data[0].medium_type,
          },
        ],
      }
    },
  },
  methods: {
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (err) return reject(err)
          resolve(values)
        })
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        if (values.commit_bound) {
          values.cmtbound = values.commit_bound
          Reflect.deleteProperty(values, 'commit_bound')
        }
        const manager = new this.$Manager('storages', 'v2')
        await manager.batchPerformAction({
          ids: this.params.data.map(item => item.id),
          action: 'set-commit-bound',
          data: values,
        })
        this.cancelDialog()
        this.$message.success(this.$t('storage.text_62'))
        this.params.refresh()
        this.loading = false
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
