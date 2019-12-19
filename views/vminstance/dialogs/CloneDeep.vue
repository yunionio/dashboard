<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <div slot="message">
          状态异常的实例不支持主机克隆<br />
          开机状态下克隆主机时无法同步克隆过程中产生的数据<br />
          主机克隆会先生成一个主机快照，快照占用配额资源，建议及时清除无用快照<br />
        </div>
      </a-alert>
      <dialog-selected-tips :count="params.data.length" :action="action" />
      <vxe-grid
        class="mb-2"
        :data="params.data"
        :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc">
        <a-form-item v-bind="formItemLayout" label="克隆方式">
          <a-radio-group
            v-decorator="decorators.cloneType">
            <a-radio value="newSnapshot">新主机快照克隆</a-radio>
            <a-radio value="oldSnapshot" :disabled="oldSnapshotDisabled">已有主机快照克隆</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item
          v-bind="formItemLayout"
          label="名称">
          <a-input
            v-decorator="decorators.name"
            :placeholder="$t('validator.resourceName')" />
          <div slot="extra">
            <div v-if="showRepeatTips">名称重复，系统默认追加“-1”</div>
          </div>
        </a-form-item>
        <a-form-item label="数量" v-bind="formItemLayout">
          <a-input-number v-decorator="decorators.count" :max="5" :min="1" :step="1" step-strictly />
        </a-form-item>
        <a-form-item label="自动删除" v-bind="formItemLayout" extra="克隆完成后删除本次克隆生成的主机快照" v-if="isNewSnapshotClone">
          <a-switch v-decorator="decorators.auto_delete_instance_snapshot" />
        </a-form-item>
        <a-form-item label="主机快照" v-bind="formItemLayout" v-else>
          <base-select
            :options="snapshotOptions"
            v-decorator="decorators.snapshot"
            :select-props="{ placeholder: '请选择主机快照' }" />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{
        $t("dialog.ok")
      }}</a-button>
      <a-button @click="cancelDialog">{{ $t("dialog.cancel") }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import debounce from 'lodash/debounce'
import * as R from 'ramda'
import { INPUT_DEBOUNCE_TIMER } from '@/constants/config'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'VmCloneDeepDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      showRepeatTips: false,
      action: '主机克隆',
      form: {
        fc: this.$form.createForm(this, {
          name: 'clone_deep_create_form',
          onValuesChange: this.onValuesChange,
        }),
        fd: {
          name: '',
          cloneType: 'newSnapshot',
        },
      },
      decorators: {
        cloneType: [
          'cloneType',
          {
            initialValue: 'newSnapshot',
          },
        ],
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请输入快照名称' },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        count: [
          'count',
          {
            initialValue: 1,
            rules: [
              { required: true, message: '请选择数量' },
            ],
          },
        ],
        auto_delete_instance_snapshot: [
          'auto_delete_instance_snapshot',
          {
            valuePropName: 'checked',
            initialValue: true,
          },
        ],
        snapshot: [
          'snapshot',
          {
            rules: [
              { required: true, message: '请选择主机快照', trigger: 'change' },
            ],
          },
        ],
      },
      formItemLayout: {
        labelCol: { span: 3 },
        wrapperCol: { span: 21 },
      },
      snapshotParams: {
        scope: this.$store.getters.scope,
        usable: true,
        guest_id: this.params.data[0].id,
      },
      snapshotOptions: [],
    }
  },
  computed: {
    isNewSnapshotClone () {
      return this.form.fd.cloneType === 'newSnapshot'
    },
    manager () {
      return new this.$Manager('servers', 'v2')
    },
    diskCount () {
      return this.params.data[0].disk_count
    },
    oldSnapshotDisabled () {
      return this.snapshotOptions.length === 0
    },
  },
  watch: {
    'form.fd.name' (val) {
      this.debounceCheckTemplateName()
    },
  },
  created () {
    this.debounceCheckTemplateName = debounce(() => {
      this.checkTemplateName()
    }, INPUT_DEBOUNCE_TIMER)
    this.fetchSnapshotList()
  },
  methods: {
    checkTemplateName () {
      const name = this.form.fd.name
      if (!R.isNil(name) && !R.isEmpty(name)) {
        this.manager.get({ id: name })
          .then(res => {
            const data = res.data
            if (!R.isNil(data) && !R.isEmpty(data)) {
              this.showRepeatTips = true // 重复名字
            }
          }).catch(() => {
            this.showRepeatTips = false
          })
      } else {
        this.showRepeatTips = false
      }
    },
    async doCreateByNewSnapshot () {
      const values = await this.form.fc.validateFields()
      const params = {
        generate_name: values.name,
        name: values.name,
        count: values.count,
        auto_delete_instance_snapshot: values.auto_delete_instance_snapshot,
      }
      return this.params.list.onManager('performAction', {
        id: this.params.data[0].id,
        steadyStatus: ['running', 'ready'],
        managerArgs: {
          action: 'snapshot-and-clone',
          data: params,
        },
      })
    },
    async doCreateByOldSnapshot () {
      const values = await this.form.fc.validateFields()
      const params = {
        instance_snapshot_id: values.snapshot,
        generate_name: values.name,
        name: values.name,
        count: values.count,
        auto_delete_instance_snapshot: false,
      }
      return this.manager.create({ data: params })
    },
    async handleConfirm () {
      this.loading = true
      try {
        if (this.isNewSnapshotClone) {
          await this.doCreateByNewSnapshot()
        } else {
          await this.doCreateByOldSnapshot()
          this.params.list.refresh()
        }
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
    onValuesChange (props, values) {
      Object.keys(values).forEach((key) => {
        this.form.fd[key] = values[key]
      })
    },
    async fetchSnapshotList () {
      const params = {
        scope: this.$store.getters.scope,
        guest_id: this.params.data[0].id,
        usable: true,
      }
      const { data } = await new this.$Manager('instance_snapshots', 'v2').list({ params })
      this.snapshotOptions = data.data.map((item) => {
        return {
          key: item.id,
          label: item.name,
        }
      })
    },
  },
}
</script>
