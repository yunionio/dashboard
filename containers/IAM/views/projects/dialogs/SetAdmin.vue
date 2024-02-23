<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.project')" :count="params.data.length" :action="params.title" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form-model ref="form" :model="form" :rules="rules" v-bind="formItemLayout">
        <a-form-model-item :label="$t('iam.project_admin')">
          <base-select
            v-model="form.admin_id"
            resource="users"
            filterable
            remote
            :params="userParams"
            :select-props="{allowClear: true, placeholder: $t('common.tips.select', [$t('iam.project_admin')])}" />
        </a-form-model-item>
      </a-form-model>
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
  name: 'ProjectSetAdminDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      userParams: {
        limit: 20,
        scope: this.$store.getters.scope,
      },
      form: {
        admin_id: this.params.data[0].admin_id || undefined,
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
  created () {
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        await this.params.onManager('batchPerformAction', {
          id: this.params.data.map(item => item.id),
          managerArgs: {
            action: 'set-admin',
            data: {
              user_id: this.form.admin_id,
            },
          },
        })
        this.cancelDialog()
        this.params.success()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
