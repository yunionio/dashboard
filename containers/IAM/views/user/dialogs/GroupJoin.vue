<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('system.text_498', [$t('dictionary.group')])}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.user')" :count="params.data.length" :action="params.title" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('dictionary.group')">
          <a-select
            :filterOption="filterOption"
            :loading="groupLoading"
            v-decorator="decorators.groups"
            mode="multiple"
            :placeholder="$t('rules.group')">
            <a-select-option v-for="item in groups" :key="item.id">
              {{item.name}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item v-if="isUserDisabled" :label="$t('iam.enabled_user')" v-bind="formItemLayout" :extra="$t('iam.user_can_enabled')">
          <a-switch
            :checkedChildren="$t('common_292')"
            :unCheckedChildren="$t('common_293')"
            v-decorator="decorators.enabled" />
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
  name: 'UserGroupJoinDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      groups: [],
      groupLoading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        groups: [
          'groups',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('system.text_499') },
            ],
          },
        ],
        enabled: [
          'enabled',
          {
            initialValue: false,
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
    isUserDisabled () {
      return !this.params.data[0].enabled
    },
  },
  created () {
    this.fetchGroups()
  },
  methods: {
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    async fetchGroups (query) {
      const manager = new this.$Manager('groups', 'v1')
      this.groupLoading = true
      try {
        const { data } = await manager.list({
          params: {
            domain_id: this.params.data[0].domain_id,
            scope: this.$store.getters.scope,
          },
        })
        this.groups = data.data || []
      } catch (err) {
        throw err
      } finally {
        this.groupLoading = false
      }
    },
    async handleConfirm () {
      this.loading = true
      const { refresh } = this.params
      try {
        const values = await this.form.fc.validateFields()
        const data = {
          gids: values.groups,
          action: 'join',
        }
        if (values.enabled) data.enabled = true
        await new this.$Manager('users', 'v1').objectRpc({
          objId: this.params.resItem.id,
          methodname: 'DoJoinGroups',
          params: data,
        })
        refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
