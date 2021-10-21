<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ title }}</div>
    <div slot="body">
      <a-form
        class="mt-3"
        :form="form.fc"
        v-bind="formItemLayout"
        hideRequiredMark>
        <scope-radio
          :disabled="isUpdate"
          :decorators="decorators"
          :form="form"
          :label="$t('system.notify.topic.receiver.resource_scope')"
          @change="scopeChange"  />
        <a-form-item :label="$t('system.text_48')">
          <a-radio-group v-decorator="decorators.type"  @change="handleTypeChange" :disabled="isUpdate">
            <a-radio-button
              v-for="item in sub_types"
              :value="item.key"
              :key="item.key">{{ item.label }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item v-if="curType === 'receiver'" :label="$t('system.notify.subscriber.type.receiver')">
          <base-select
            v-decorator="decorators.receivers"
            class="w-100"
            :filterable="true"
            needParams
            resource="receivers"
            version="v1"
            option-label-prop="label"
            :isDefaultSelect="true"
            :params="recipientParams"
            :select-props="{ placeholder: $t('system.text_232', [$t('system.notify.subscriber.type.receiver')]), allowClear: false, mode: 'multiple' }">
            <template #optionTemplate="{ options }">
              <a-select-option v-for="item in options" :key="item.id" :value="item.id" :label="item.name">
                <a-row>
                  <a-col span="9">{{ item.name }}</a-col>
                  <a-col><p class="text-right text-color-secondary mr-2">{{ $t('common_624', [$t('dictionary.domain')]) }}: {{ item.project_domain }}</p></a-col>
                </a-row>
              </a-select-option>
            </template>
          </base-select>
        </a-form-item>
        <a-form-item v-if="curType === 'role'" :label="$t('system.notify.subscriber.type.role')">
          <a-row type="flex">
            <a-col :flex="2" class="mr-2">
              <base-select
                v-decorator="decorators.role_scope"
                :options="roleScopeOptions"
                :select-props="{ placeholder: $t('system.text_232', [$t('common_235')]), allowClear: false }" />
            </a-col>
            <a-col :flex="3">
              <base-select
                v-decorator="decorators.role"
                :filterable="true"
                needParams
                resource="roles"
                version="v1"
                :isDefaultSelect="true"
                :applyOptionLabel="true"
                :params="recipientParams"
                :select-props="{ placeholder: $t('system.text_232', [$t('system.notify.subscriber.type.role')]), allowClear: false }" />
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item v-if="curType === 'robot'" :label="$t('system.notify.subscriber.type.robot')">
          <base-select
            v-decorator="decorators.robot"
            class="w-100"
            :filterable="true"
            needParams
            resource="robots"
            version="v1"
            option-label-prop="label"
            :isDefaultSelect="true"
            :params="recipientParams"
            :select-props="{ placeholder: $t('system.text_232', [$t('system.notify.subscriber.type.robot')]), allowClear: false }" />
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
import { NOTIFY_SUBSCRIBER_TYPES, NOTIFY_ROLE_SCOPES } from '../../../constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import ScopeRadio from '@/sections/ScopeRadio'

export default {
  name: 'SetupNotifyReceiverDialog',
  components: { ScopeRadio },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const initialValues = {}
    if (this.params.data && this.params.data.id) {
      // update
      const s = this.params.data
      initialValues.scope = s.resource_scope
      initialValues.resource_scope = s.resource_scope
      if (s.resource_scope === 'domain') initialValues.domain = s.resource_attribution_id
      if (s.resource_scope === 'project') initialValues.project = s.resource_attribution_id
      initialValues.type = s.type
      initialValues.role_scope = s.role_scope
      initialValues.role = s.role ? s.role.id : ''
      initialValues.robot = s.robot ? s.robot.id : ''
      initialValues.receivers = s.receivers ? s.receivers.map(r => r.id) : []
    } else {
      // create
      initialValues.scope = this.$store.getters.scope
      initialValues.resource_scope = this.$store.getters.scope
      initialValues.type = NOTIFY_SUBSCRIBER_TYPES[0].key
      initialValues.role_scope = 'system'
    }

    return {
      loading: false,
      isAdminMode: this.$store.getters.isAdminMode,
      curType: initialValues.type,
      sub_types: NOTIFY_SUBSCRIBER_TYPES,
      roleScopeOptions: NOTIFY_ROLE_SCOPES,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.form.fd[key] = values[key]
            })
          },
        }),
        fd: {
          ...initialValues,
        },
      },
      decorators: {
        scope: [
          'scope',
          {
            initialValue: initialValues.resource_scope,
          },
        ],
        domain: [
          'domain',
          {
            initialValue: initialValues.domain,
            rules: [
              { required: !this.params.data, message: `${this.$t('common.select')}` },
            ],
          },
        ],
        project: [
          'project',
          {
            initialValue: initialValues.project,
            rules: [
              { required: !this.params.data, message: `${this.$t('common.select')}` },
            ],
          },
        ],
        type: [
          'type',
          {
            initialValue: initialValues.type,
            rules: [
              { required: true, message: `${this.$t('common.select')}` },
            ],
          },
        ],
        receivers: [
          'receivers',
          {
            initialValue: initialValues.receivers,
            rules: [
              { required: true, message: `${this.$t('common.select')}` },
            ],
          },
        ],
        robot: [
          'robot',
          {
            initialValue: initialValues.robot,
            rules: [
              { required: true, message: `${this.$t('common.select')}` },
            ],
          },
        ],
        role: [
          'role',
          {
            initialValue: initialValues.role,
            rules: [
              { required: true, message: `${this.$t('common.select')}` },
            ],
          },
        ],
        role_scope: [
          'role_scope',
          {
            initialValue: initialValues.role_scope,
            rules: [
              { required: true, message: `${this.$t('common.select')}` },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 19,
        },
        labelCol: {
          span: 5,
        },
      },
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    isUpdate () {
      return this.params.data && this.params.data.id
    },
    title () {
      if (this.params.data && this.params.data.id) {
        return this.$t('system.text_141', [this.$t('system.notify.subscriber.type.receiver')])
      }
      return this.$t('system.text_130', [this.$t('system.notify.subscriber.type.receiver')])
    },
    recipientParams () {
      return {
        limit: 0,
        scope: this.$store.getters.scope,
        with_meta: true,
        enabled: true,
      }
    },
  },
  destroyed () {
    this.manager = null
  },
  created () {
    this.manager = new this.$Manager('subscribers', 'v1')
  },
  methods: {
    handleTypeChange (e) {
      this.curType = e.target.value
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        let resource_attribution_id = ''
        if (values.scope === 'domain') resource_attribution_id = values.domain || this.userInfo.projectDomainId
        if (values.scope === 'project') resource_attribution_id = values.project || this.userInfo.projectId
        const params = {
          receivers: values.receivers,
          role_scope: values.role_scope,
          role: values.role,
          robot: values.robot,
        }
        if (this.isUpdate) {
          // params.topic_id = this.params.data.topic_id || this.params.resId
          await this.manager.performAction({
            id: this.params.data.id,
            action: 'change',
            data: params,
          })
        } else {
          params.scope = this.$store.getters.scope
          params.resource_scope = values.scope
          params.resource_attribution_id = resource_attribution_id
          params.topic_id = this.params.resId
          params.type = values.type
          await this.manager.create({
            data: params,
          })
        }
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
