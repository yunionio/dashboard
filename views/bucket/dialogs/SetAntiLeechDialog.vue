
<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('storage.text_205')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="params.name" :count="params.data.length" :action="$t('storage.text_205')" />
      <dialog-table class="mb-2" :data="params.data" :columns="[params.columns[0], params.columns[7], params.columns[9]]" />
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('storage.text_208')" v-bind="formItemLayout" :extra="$t('storage.text_209')">
          <a-switch v-decorator="decorators.allow_empty_refer" :checked-children="$t('storage.text_184')" :un-checked-children="$t('storage.text_185')" />
        </a-form-item>
        <a-form-item :label="$t('storage.text_219')" v-bind="formItemLayout">
          <a-textarea
            v-decorator="decorators.white_list"
            :placeholder="$t('storage.text_207')"
            :auto-size="{ minRows: 3, maxRows: 5 }" />
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
  name: 'SetAntiLeechDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      enabled: this.params.data[0].referer?.enabled || false,
      decorators: {
        white_list: [
          'white_list',
          {
            initialValue: this.params.data[0].referer?.white_list ? this.params.data[0].referer.white_list.join('\n') : '',
          },
        ],
        allow_empty_refer: [
          'allow_empty_refer',
          {
            valuePropName: 'checked',
            initialValue: this.params.data[0].referer?.allow_empty_refer || false,
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
    ...mapGetters(['isAdminMode', 'scope', 'userInfo']),
  },
  methods: {
    handleEnabledChange (val) {
      this.enabled = val
    },
    doSet (data) {
      return this.params.onManager('performAction', {
        id: this.params.data[0].id,
        managerArgs: {
          action: 'set-referer',
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        if (values.white_list) values.white_list = values.white_list.trim().split('\n')
        if (values.white_list === '') delete values.white_list
        await this.doSet(values)
        this.loading = false
        this.cancelDialog()
        this.params.success()
        this.params.refresh()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
