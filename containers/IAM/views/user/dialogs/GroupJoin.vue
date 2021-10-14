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
      },
      formItemLayout: {
        wrapperCol: {
          span: 22,
        },
        labelCol: {
          span: 2,
        },
      },
    }
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
        await new this.$Manager('users', 'v1').objectRpc({
          objId: this.params.resItem.id,
          methodname: 'DoJoinGroups',
          params: {
            gids: values.groups,
            action: 'join',
          },
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
