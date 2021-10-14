<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('system.text_195', [$t('dictionary.project')]) }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.group')" :count="params.data.length" :action="$t('system.text_195', [$t('dictionary.project')])" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('dictionary.domain')" v-if="isAdminMode">
          <a-radio-group v-decorator="decorators.domain" v-if="!l3PermissionEnable">
            <template v-for="item of domainOptions">
              <a-radio-button :value="item.key" :key="item.key">{{ item.label }}</a-radio-button>
            </template>
          </a-radio-group>
          <base-select v-else
            v-decorator="decorators.domain"
            version="v1"
            resource="domains"
            filterable
            :params="domainParams"
            :select-props="{ placeholder: $t('rules.project') }"
            @change="domainChange" />
        </a-form-item>
        <a-form-item :label="$t('dictionary.project')">
          <base-select
            v-decorator="decorators.projects"
            resource="projects"
            version="v1"
            remote
            :params="projectsParams"
            :remote-fn="q => ({ filter: `name.contains(${q})` })"
            :select-props="{ mode: 'multiple' }" />
        </a-form-item>
        <a-form-item :label="$t('dictionary.role')">
          <base-select
            v-decorator="decorators.roles"
            resource="roles"
            version="v1"
            remote
            :params="rolesParams"
            :remote-fn="q => ({ filter: `name.contains(${q})` })"
            :select-props="{ mode: 'multiple' }" />
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
  name: 'GroupJoinProjectDialog',
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
        projects: [
          'projects',
          {
            rules: [
              {
                required: true,
                message: this.$t('rules.project'),
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
    }
  },
  computed: {
    ...mapGetters(['scope', 'l3PermissionEnable', 'isAdminMode']),
    ...mapGetters('auth', ['isSystemAdmin', 'isDomainAdmin']),
    domainOptions () {
      const ret = []
      if ((this.params.data[0].domain_id !== 'default' && this.isAdminMode) || !this.l3PermissionEnable) {
        ret.push({
          label: 'Default',
          key: 'default',
        })
      }
      if (this.l3PermissionEnable) {
        ret.unshift({
          label: this.params.data[0].project_domain,
          key: this.params.data[0].domain_id,
        })
      }
      return ret
    },
    projectsParams () {
      const params = {
        scope: this.scope,
        domain_id: this.domain_id,
      }
      // const gid = get(this, 'params.data[0].id')
      // if (gid) {
      //   params.group = gid
      //   params.jointable = true
      // }
      return params
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
    this.manager = new this.$Manager('groups', 'v1')
    if (!this.l3PermissionEnable) {
      this.domain_id = 'default'
    }
  },
  methods: {
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
