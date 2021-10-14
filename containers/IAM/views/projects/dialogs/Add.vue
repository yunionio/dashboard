<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('common_114')}}</div>
    <div slot="body">
      <!--a-alert :showIcon="false" banner class="mb-2">
        <div slot="message">{{$t('system.text_453', [$t('dictionary.policy', $t('dictionary.role'))]) }}
        </div>
      </a-alert-->
      <dialog-selected-tips :name="$t('dictionary.project')" :count="params.data.length" :action="$t('common_114')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 2)" />
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('system.text_48')" v-bind="formItemLayout">
          <a-radio-group v-model="type" @change="handleTypeChange">
            <a-radio-button
              v-for="item of typeOptions"
              :key="item.value"
              :value="item.value">
              {{item.label}}
            </a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('dictionary.domain')" v-bind="formItemLayout" v-if="isAdminMode">
          <base-select
            v-decorator="decorators.domain"
            version="v1"
            resource="domains"
            filterable
            :params="domainParams"
            :select-props="{ placeholder: $t('rules.project') }"
            @change="domainChange" />
        </a-form-item>
        <a-form-item v-if="type === 'group'" :label="$t('dictionary.group')" v-bind="formItemLayout" key="group">
          <base-select
            v-decorator="decorators.groups"
            resource="groups"
            version="v1"
            remote
            :params="groupsParams"
            :remote-fn="q => ({ filter: `name.contains(${q})` })"
            :cancel-token="groupsCancelToken"
            :destroyedCallBack="groupDestroyed"
            :select-props="{ mode: 'multiple' }">
            <template v-slot:optionTemplate="{ options }">
              <a-select-option v-for="item in options" :key="item.id" :value="item.id" :disabled="item.__disabled">
                <div class="d-flex">
                  <span class="text-truncate flex-fill mr-2">{{ item.name }}</span>
                  <!-- template v-if="domain_id === 'default'" -->
                  <span style="color: #8492a6; font-size: 13px">{{ $t('dictionary.domain') }}：{{ item.project_domain }}</span>
                  <!-- /template -->
                </div>
              </a-select-option>
            </template>
          </base-select>
        </a-form-item>
        <a-form-item v-if="type === 'user'" :label="$t('dictionary.user')" v-bind="formItemLayout" key="user">
          <base-select
            v-decorator="decorators.users"
            resource="users"
            version="v1"
            :params="usersParams"
            remote
            :remote-fn="q => ({ filter: `name.contains(${q})` })"
            :cancel-token="usersCancelToken"
            :destroyedCallBack="userDestroyed"
            :select-props="{ mode: 'multiple' }">
            <template v-slot:optionTemplate="{ options }">
              <a-select-option v-for="item in options" :key="item.id" :value="item.id" :disabled="item.__disabled">
                <div class="d-flex">
                  <span class="text-truncate flex-fill mr-2">{{ item.name }}</span>
                  <!-- template v-if="domain_id === 'default'" -->
                  <span style="color: #8492a6; font-size: 13px">{{ $t('dictionary.domain') }}：{{ item.project_domain }}</span>
                  <!-- /template -->
                </div>
              </a-select-option>
            </template>
          </base-select>
        </a-form-item>
        <a-form-item :label="$t('dictionary.role')" v-bind="formItemLayout">
          <base-select
            v-decorator="decorators.roles"
            resource="roles"
            version="v1"
            remote
            :params="rolesParams"
            :remote-fn="q => ({ filter: `name.contains(${q})` })"
            :select-props="{ mode: 'multiple' }">
            <template v-slot:optionTemplate="{ options }">
              <a-select-option v-for="item in options" :key="item.id" :value="item.id" :disabled="item.__disabled">
                <div class="d-flex">
                  <span class="text-truncate flex-fill mr-2">{{ item.name }}</span>
                  <template v-if="domain_id === 'default'">
                    <span style="color: #8492a6; font-size: 13px">{{ $t('dictionary.domain') }}：{{ item.project_domain }}</span>
                  </template>
                </div>
              </a-select-option>
            </template>
          </base-select>
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
import axios from 'axios'
import { mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ProjectAddUserOrGroupDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const domainId = this.params.data[0].domain_id
    return {
      loading: false,
      domain_id: domainId,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        domain: [
          'domain',
          {
            initialValue: domainId,
          },
        ],
        groups: [
          'groups',
          {
            rules: [
              {
                required: true,
                message: this.$t('rules.group'),
              },
            ],
          },
        ],
        users: [
          'users',
          {
            rules: [
              {
                required: true,
                message: this.$t('rules.user'),
              },
            ],
          },
        ],
        roles: [
          'roles',
          {
            rules: [
              {
                required: true,
                message: this.$t('rules.role'),
              },
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
      type: 'user',
      typeOptions: [
        {
          label: this.$t('common_312'),
          value: 'user',
        },
        {
          label: this.$t('common_308'),
          value: 'group',
        },
      ],
    }
  },
  computed: {
    ...mapGetters(['scope', 'isAdminMode']),
    domainOptions () {
      const ret = [
        { label: this.params.data[0].project_domain, value: this.params.data[0].domain_id },
      ]
      return ret
    },
    groupsParams () {
      if (this.domain_id !== 'default') {
        return {
          scope: this.scope,
          domain_id: this.domain_id,
        }
      }
      return {
        scope: this.scope,
        domain_id: this.domain_id,
      }
    },
    usersParams () {
      if (this.domain_id !== 'default') {
        return {
          scope: this.scope,
          domain_id: this.domain_id,
        }
      }
      return {
        scope: this.scope,
        domain_id: this.domain_id,
      }
    },
    rolesParams () {
      return {
        scope: this.scope,
        domain_id: this.domain_id,
      }
    },
    domainParams () {
      return {
        scope: this.scope,
      }
    },
  },
  // watch: {
  //   domain_id () {
  //     this.form.fc.resetFields()
  //   },
  // },
  destroyed () {
    this.manager = null
  },
  created () {
    this.manager = new this.$Manager('projects', 'v1')
    this.groupsCancelToken = new axios.CancelToken(cancel => { this.groupsCancel = cancel })
    this.usersCancelToken = new axios.CancelToken(cancel => { this.usersCancel = cancel })
  },
  methods: {
    handleTypeChange (e) {
      if (e.target.value === 'group') {
        this.groupsCancelToken = new axios.CancelToken(cancel => { this.groupsCancel = cancel })
      } else {
        this.usersCancelToken = new axios.CancelToken(cancel => { this.usersCancel = cancel })
      }
    },
    groupDestroyed () {
      this.groupsCancel()
    },
    userDestroyed () {
      this.usersCancel()
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.manager.performAction({
          id: this.params.data[0].id,
          action: 'join',
          data: values,
        })
        this.loading = false
        this.$bus.$emit('ProjectDirectlyUnderUserListRefresh')
        this.params.success()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    domainChange (val) {
      this.domain_id = val
    },
  },
}
</script>
