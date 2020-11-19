
<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('storage.text_205')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="params.name" :count="params.data.length" :action="params.title" />
      <dialog-table class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('storage.text_41')" v-bind="formItemLayout">
          <a-switch v-decorator="decorators.enabled" :checked-children="$t('storage.text_184')" :un-checked-children="$t('storage.text_185')" @change="handleEnabledChange" />
        </a-form-item>
        <template v-if="this.enabled">
          <div>
            <a-form-item :label="$t('storage.text_86')" v-bind="formItemLayout">
              <a-radio-group v-decorator="decorators.type">
                <a-radio-button value="White-List">{{$t('storage.text_206')}}</a-radio-button>
              </a-radio-group>
            </a-form-item>
            <a-form-item label="Referer" v-bind="formItemLayout">
              <a-textarea
                v-decorator="decorators.domain_list"
                :placeholder="$t('storage.text_207')"
                :auto-size="{ minRows: 3, maxRows: 5 }" />
            </a-form-item>
            <a-form-item :label="$t('storage.text_208')" v-bind="formItemLayout" :extra="$t('storage.text_209')">
              <a-switch v-decorator="decorators.allow_empty_refer" :checked-children="$t('storage.text_184')" :un-checked-children="$t('storage.text_185')" />
            </a-form-item>
          </div>
        </template>
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
        enabled: [
          'enabled',
          {
            valuePropName: 'checked',
            initialValue: this.params.data[0].referer?.enabled || false,
          },
        ],
        type: [
          'type',
          {
            initialValue: 'White-List',
          },
        ],
        domain_list: [
          'domain_list',
          {
            initialValue: this.params.data[0].referer?.domain_list ? this.params.data[0].referer.domain_list.join('\n') : '',
            rules: [
              { required: true, message: this.$t('storage.text_210') },
            ],
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
          span: 21,
        },
        labelCol: {
          span: 3,
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
        values.domain_list = values.domain_list.trim().split('\n')
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
