<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">设置共享</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" action="设置共享" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item label="是否共享" v-bind="formItemLayout">
          <a-switch v-decorator="decorators.isPublic" @change="switchChange" :checked="isShare" />
        </a-form-item>
        <a-form-item v-bind="formItemLayout" label="共享范围" v-show="isShare">
          <a-radio-group v-decorator="decorators.range">
            <a-radio-button v-for="item in scopeOptions" :value="item.value" :key="item.value">
              {{item.label}}
            </a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="项目" v-bind="formItemLayout" v-if="isShare && isProjectScope">
          <base-select
            resource="projects"
            v-decorator="decorators.project"
            :params="projectParams"
            version="v1"
            :need-params="true"
            :mapper="projectMapper"
            :select-props="{ placeholder: '请选择项目' }" />
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
import * as R from 'ramda'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'SetPublicDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      range: 'system',
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            if (R.has('range', values)) {
              this.range = values.range
            }
          },
        }),
      },
      decorators: {
        isPublic: [
          'isPublic',
        ],
        range: [
          'range',
          {
            initialValue: this.$store.getters.isAdminMode ? 'system' : this.$store.getters.l3PermissionEnable ? 'domain' : 'project',
            rules: [
              { required: true, message: '请选择共享范围' },
            ],
          },
        ],
        project: [
          'project',
          {
            rules: [
              { required: true, message: '请填写名称' },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 8,
        },
        labelCol: {
          span: 3,
        },
      },
      isShare: true,
    }
  },
  computed: {
    scopeOptions () {
      let ret = [
        { label: '系统', value: 'system' },
        { label: '项目', value: 'project' },
      ]
      if (this.$store.getters.l3PermissionEnable) {
        ret.splice(1, 0, { label: '当前域', value: 'domain' })
      }
      if (this.$store.getters.isDomainMode) {
        ret.shift()
      }
      return ret
    },
    projectParams () {
      let params = {
        limit: 0,
        project_domain: this.params.data[0].domain_id,
      }
      return params
    },
    isProjectScope () {
      return this.range === 'project'
    },
  },
  watch: {
    'params.data': {
      handler (newValue, oldValue) {
        if (!newValue[0].is_public && !newValue[0].shared_projects) {
          this.isShare = false
        } else {
          this.isShare = true
        }
        if (newValue[0]['public_scope']) {
          this.$nextTick(() => {
            this.form.fc.setFieldsValue({ 'range': newValue[0]['public_scope'] })
          })
        }
        if (!this.$store.getters.l3PermissionEnable && this.$store.getters.isDomainAdmin) {
          this.$nextTick(() => {
            this.form.fc.setFieldsValue({ 'range': 'project' })
          })
        }
      },
      immediate: true,
    },
  },
  methods: {
    switchChange (e) {
      this.isShare = e
    },
    projectMapper (list) {
      return list.filter((item) => { return item.id !== this.params.data[0].tenant_id })
    },
    doUpdate (ids) {
      return this.params.list.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: this.params.list.steadyStatus,
        managerArgs: {
          action: 'private',
        },
      })
    },
    setPublic (ids, data) {
      return this.params.list.onManager('batchPerformAction', {
        id: ids,
        managerArgs: {
          action: 'public',
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const ids = this.params.data.map(item => item.id)
        let newValue = []
        newValue.push(values.project)
        if (!this.isShare) {
          await this.doUpdate(ids)
        } else {
          if (values.range === 'project') {
            const data = {
              scope: values.range,
              shared_projects: newValue,
            }
            await this.setPublic(ids, data)
          } else {
            const data = {
              scope: values.range,
            }
            await this.setPublic(ids, data)
          }
        }
        this.loading = false
        this.cancelDialog()
        this.params.list.refresh()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
