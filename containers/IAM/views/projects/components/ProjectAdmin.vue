<template>
  <div class="d-flex align-items-center project-admin">
    <list-body-cell-wrap
      :row="row"
      :onManager="onManager"
      field="admin"
      :title="row.admin"
      hide-field>
      <side-page-trigger v-if="row.admin_id && hasPer" permission="users_get" name="UserSidePage" :id="row.admin_id" :vm="this">{{ row.admin }}</side-page-trigger>
      <span v-else>{{row.admin || '-'}}</span>
      <a-icon v-if="!visiable" type="edit" class="primary-color ml-2 edit-icon" @click="showForm" />
    </list-body-cell-wrap>
    <a-popover
      v-model="visiable"
      :title="$t('iam.modify_sth', [$t('iam.project_admin')])"
      trigger="click"
      :destroyTooltipOnHide="true">
      <a-icon v-if="visiable" type="edit" class="primary-color ml-2" />
      <div slot="content" style="width: 300px">
        <a-form-model ref="form" :model="form" :rules="rules" v-bind="layout">
          <a-form-model-item :label="$t('system.text_6')" prop="admin_id">
            <base-select
              v-model="form.admin_id"
              resource="users"
              filterable
              remote
              :params="userParams"
              :select-props="{allowClear: true, placeholder: $t('common.tips.select', [$t('iam.project_admin')])}" />
          </a-form-model-item>
          <div class="text-right">
            <a-button type="primary" @click="handleConfirm">{{ $t('dialog.ok') }}</a-button>
            <a-button class="ml-3" @click="cancel">{{ $t('dialog.cancel') }}</a-button>
          </div>
        </a-form-model>

      </div>
    </a-popover>
  </div>

</template>

<script>
import WindowsMixin from '@/mixins/windows'
import { validateModelForm } from '@/utils/validate'
import { hasPermission } from '@/utils/auth'

export default {
  mixins: [WindowsMixin],
  props: {
    row: {
      required: true,
      type: Object,
    },
    manager: {
      required: true,
      type: Function,
    },
  },
  data () {
    return {
      visiable: false,
      userParams: {
        limit: 20,
        scope: this.$store.getters.scope,
      },
      layout: {
        labelCol: { span: 8 },
        wrapperCol: { span: 16 },
      },
      form: {
        admin_id: this.row.admin_id || undefined,
      },
      rules: {
        admin_id: [{ required: false, message: this.$t('common.tips.select', [this.$t('system.text_6')]) }],
      },
    }
  },
  computed: {
    hasPer () {
      return hasPermission({ key: 'users_list' })
    },
  },
  methods: {
    showForm () {
      this.visiable = true
    },
    cancel () {
      this.visiable = false
    },
    async handleConfirm () {
      try {
        await validateModelForm(this.$refs.form)
        await this.manager('performAction', {
          id: this.row.id,
          managerArgs: {
            action: 'set-admin',
            data: { user_id: this.form.admin_id },
          },
        })
        this.$emit('ok')
        this.cancel()
      } catch (err) {
        throw err
      }
    },
  },
}
</script>

<style lang="less" scoped>
.edit-icon {
  display: none;
}
.project-admin:hover{
  .edit-icon {
    display: inline-block;
  }
}
</style>
