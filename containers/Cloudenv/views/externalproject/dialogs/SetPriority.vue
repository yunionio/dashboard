<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{title}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="title" :name="name" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form-model
        ref="form"
        :model="fd"
        :rules="rules">
        <a-form-model-item prop="priority" :label="$t('cloudenv.priority')" v-bind="formItemLayout" :extra="$t('cloudenv.priority_extra')">
          <a-input-number v-model="fd.priority" :min="0" :precision="0" />
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
import { mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ExternalProjectSetPriorityDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      fd: {
        priority: this.params.data[0].priority || 0,
      },
      rules: {
        priority: [
          { required: true, message: this.$t('common.tips.input', [this.$t('cloudenv.prioriry')]) },
        ],
      },
      formItemLayout: this.params.formItemLayout || {
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
    ...mapGetters(['userInfo', 'l3PermissionEnable', 'isAdminMode']),
    isBatch () {
      return this.params.data.length > 1
    },
    name () {
      return this.params.name
    },
    title () {
      return this.params.title
    },
  },
  watch: {
  },
  destroyed () {
  },
  created () {
  },
  methods: {
    async doSetPriority (values) {
      return this.params.onManager('update', {
        id: this.params.data[0].id,
        managerArgs: {
          data: values,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        await this.$refs.form.validate()
        this.loading = true
        await this.doSetPriority(this.fd)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
