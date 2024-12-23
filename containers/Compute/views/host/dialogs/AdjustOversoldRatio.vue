<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_513')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.host')" :count="params.data.length" :action="$t('compute.text_513')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 2)" />
       <a-form
        :form="form.fc">
        <a-form-item :label="$t('compute.cpu_commit_bound')" v-bind="formItemLayout">
          <a-input-number v-decorator="decorators.cpu_cmtbound" :min="0.1" :step="0.1" />
        </a-form-item>
        <a-form-item :label="$t('compute.memory_commit_bound')" v-bind="formItemLayout">
          <template v-if="isOpenPage">
            <a-tooltip>
              <template slot="title">
                {{ $t('compute.host.open_page_size.tooltip') }}
              </template>
              <a-input-number v-decorator="decorators.mem_cmtbound" :min="0.1" :max="1" :step="0.1" :disabled="true" />
            </a-tooltip>
          </template>
          <a-input-number v-else v-decorator="decorators.mem_cmtbound" :min="0.1" :max="1" :step="0.1" />
          <div style="font-size:12px" class="add-desc">{{$t('compute.text_544')}}</div>
        </a-form-item>
        <a-form-item :label="$t('compute.memory_reserve_gb')" v-bind="formItemLayout">
          <template v-if="isOpenPage">
            <a-tooltip>
              <template slot="title">
                {{ $t('compute.host.open_page_size.tooltip') }}
              </template>
              <a-input-number v-decorator="decorators.mem_reserved" :min="1" :step="1" :disabled="true" />
            </a-tooltip>
          </template>
          <a-input-number v-else v-decorator="decorators.mem_reserved" :min="1" :step="1" />
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

export default {
  name: 'HostAdjustOversoldRatioDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      scope: this.$store.getters.scope,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        cpu_cmtbound: [
          'cpu_cmtbound',
          {
            validateFirst: true,
            initialValue: this.params.data[0].cpu_commit_bound,
            rules: [
              {
                required: true,
                message: this.$t('compute.text_545'),
              },
            ],
          },
        ],
        mem_cmtbound: [
          'mem_cmtbound',
          {
            validateFirst: true,
            initialValue: this.params.data[0].mem_commit_bound,
            rules: [
              {
                required: true,
                message: this.$t('compute.text_546'),
              },
            ],
          },
        ],
        mem_reserved: [
          'mem_reserved',
          {
            validateFirst: true,
            initialValue: this.params.data[0].mem_reserved / 1024,
            rules: [
              {
                required: true,
                message: this.$t('compute.memory_reserve_gb.placeholder'),
              },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 17,
        },
        labelCol: {
          span: 7,
        },
      },
    }
  },
  computed: {
    isOpenPage () {
      const firstItem = this.params.data[0]
      return firstItem?.page_size_kb > 4
    },
  },
  methods: {
    doUpdate (data) {
      const ids = this.params.data.map(item => item.id)
      return this.params.onManager('batchUpdate', {
        id: ids,
        managerArgs: {
          data: { mem_reserved: data.mem_reserved },
        },
      })
    },
    doPerformAction (data) {
      const ids = this.params.data.map(item => item.id)
      return this.params.onManager('batchPerformAction', {
        id: ids,
        managerArgs: {
          action: 'set-commit-bound',
          data: { cpu_cmtbound: data.cpu_cmtbound, mem_cmtbound: data.mem_cmtbound },
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        let values = await this.form.fc.validateFields()
        values = {
          ...values,
          // name: this.params.data[0].name,
        }
        values.mem_reserved = values.mem_reserved * 1024
        await this.doUpdate(values)
        await this.doPerformAction(values)
        this.loading = false
        this.cancelDialog()
        this.params.refresh()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
