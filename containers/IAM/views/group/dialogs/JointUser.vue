<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('system.text_452', [$t('dictionary.user')])}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.group')" :count="params.data.length" :action="params.title" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('dictionary.user')">
          <a-select
            :filterOption="filterOption"
            :loading="userLoading"
            v-decorator="decorators.users"
            mode="multiple"
            :placeholder="$t('common_489')">
            <a-select-option v-for="item in users" :key="item.id">
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
  name: 'GroupJoinUserDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      users: [],
      userLoading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        users: [
          'users',
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
    this.fetchUsers()
  },
  methods: {
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    async fetchUsers (query) {
      const manager = new this.$Manager('users', 'v1')
      this.userLoading = true
      try {
        const { data } = await manager.list({
          params: {
            domain_id: this.params.data[0].domain_id,
            scope: this.$store.getters.scope,
          },
        })
        this.users = data.data || []
      } catch (err) {
        throw err
      } finally {
        this.userLoading = false
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await new this.$Manager('groups', 'v1').performAction({
          id: this.params.data[0].id,
          action: 'add-users',
          data: {
            user: values.users,
          },
        })
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
