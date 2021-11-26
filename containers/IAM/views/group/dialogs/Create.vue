<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('system.text_130', [$t('dictionary.group')])}}</div>
    <div slot="body">
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('system.text_101')">
          <a-input v-decorator="decorators.name" />
        </a-form-item>
        <a-form-item :label="$t('common.description')">
          <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
        </a-form-item>
        <a-form-item :label="$t('dictionary.domain')" v-if="isAdminMode">
          <base-select
            v-decorator="decorators.domain_id"
            resource="domains"
            version="v1"
            remote
            :params="{ enabled: true }"
            :remote-fn="q => ({ filter: `name.contains(${q})` })"
            :select-props="{ mode: 'default' }" />
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
import { mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'GroupCreateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        name: [
          'name',
          {
            rules: [
              {
                required: true,
                message: this.$t('system.text_194'),
                whitespace: true,
              },
            ],
          },
        ],
        domain_id: [
          'domain_id',
          {
            rules: [
              {
                required: true,
                message: this.$t('rules.domain'),
              },
            ],
          },
        ],
        description: [
          'description',
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
  computed: mapGetters(['isAdminMode']),
  destroyed () {
    this.manager = null
  },
  created () {
    this.manager = new this.$Manager('groups', 'v1')
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.manager.create({
          data: values,
        })
        this.loading = false
        this.params.success()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
