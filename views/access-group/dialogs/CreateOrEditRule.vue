<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <a-form
        v-bind="formItemLayout"
        :form="form.fc">
        <a-form-item>
          <span slot="label">
            {{$t('storage.access.group.rule.source')}}&nbsp;
            <a-tooltip :title="$t('storage.access.group.rule.source.tooltip')">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-input :disabled="IPCheckboxDisabled" v-decorator="decorators.source" />
          <a-checkbox class="right-checkbox" @change="sourceChanged" :checked="isIPChecked">{{$t('compute.text_997')}}</a-checkbox>
        </a-form-item>
        <a-form-item :label="$t('storage.access.group.rule.rw.access_type')">
          <a-radio-group v-decorator="decorators.rw_access_type">
            <a-radio value="RW">{{$t('storage.access.group.rule.rw.access_type.rw')}}</a-radio>
            <a-radio value="R">{{$t('storage.access.group.rule.rw.access_type.r')}}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('storage.access.group.rule.user.access_type')">
          <a-radio-group v-decorator="decorators.user_access_type">
            <a-radio value="no_root_squash">{{$t('storage.access.group.rule.user.access_type.no_root_squash')}}</a-radio>
            <a-radio value="root_squash">{{$t('storage.access.group.rule.user.access_type.root_squash')}}</a-radio>
            <a-radio value="all_squash">{{$t('storage.access.group.rule.user.access_type.all_squash')}}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item>
          <span slot="label">{{$t('compute.text_1001')}}<a-tooltip :title="$t('compute.text_1002')">
              <a-icon type="question-circle-o" />
            </a-tooltip>
          </span>
          <a-input-number :min="1" :max="100" v-decorator="decorators.priority" />
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
  name: 'AccessGroupRuleEditDialog',
  mixins: [DialogMixin, WindowsMixin],
  props: {
    id: {
      type: String,
      required: true,
    },
  },
  data () {
    const selectItem = this.params.data[0]
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        source: [
          'source',
          {
            validateFirst: true,
            initialValue: selectItem.source || '',
            rules: [
              { required: true, message: this.$t('compute.text_996') },
              { validator: this.$validate('source') },
            ],
          },
        ],
        rw_access_type: [
          'rw_access_type',
          {
            initialValue: selectItem.rw_access_type || 'RW',
            rules: [
              { required: true },
            ],
          },
        ],
        user_access_type: [
          'user_access_type',
          {
            initialValue: selectItem.user_access_type || 'all_squash',
            rules: [
              { required: true },
            ],
          },
        ],
        priority: [
          'priority',
          {
            initialValue: selectItem.priority || 1,
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 14,
        },
        labelCol: {
          span: 4,
        },
      },
      IPCheckboxDisabled: selectItem.cidr === '0.0.0.0/0',
      isIPChecked: selectItem.cidr === '0.0.0.0/0',
    }
  },
  methods: {
    sourceChanged (e) {
      this.IPCheckboxDisabled = !this.IPCheckboxDisabled
      this.isIPChecked = !this.isIPChecked
      if (e.target.checked) {
        this.$nextTick(() => {
          this.form.fc.setFieldsValue({ source: '0.0.0.0/0' })
        })
      } else {
        this.$nextTick(() => {
          this.form.fc.resetFields(['source'])
        })
      }
    },
    saveEdit (data) {
      if (this.params.data[0].id) {
        const id = this.params.data[0].id
        return new this.$Manager('access_group_rules').update({
          id,
          data,
        })
      }
      const params = {
        ...data,
        access_group_id: this.params.access_group_id,
      }
      return new this.$Manager('access_group_rules').create({
        data: params,
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.saveEdit(values)
        this.loading = false
        this.params.refresh && this.params.refresh()
        this.cancelDialog()
      } catch (e) {
        this.loading = false
        throw e
      }
    },
  },
}
</script>

<style lang="less" scoped>
.right-checkbox {
  width: 100px;
  height: 40px;
  left: 470px;
  font-size: 12px!important;
  color: #ccc;
  position: absolute;
}
</style>
