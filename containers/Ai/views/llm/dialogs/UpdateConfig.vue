<template>
  <base-dialog :width="900" @cancel="cancelDialog">
    <div slot="header">{{ $t('aice.llm_update_config') }}</div>
    <div slot="body">
      <dialog-selected-tips :name="isApplyType ? $t('aice.app_llm') : $t('aice.llm')" :count="1" :action="$t('aice.llm_update_config')" />
      <a-form :form="form.fc" hideRequiredMark v-bind="formItemLayout">
        <a-form-item v-if="supportMountedModels" :label="$t('aice.model')" :extra="$t('aice.llm_override_sku_extra')">
          <base-select
            v-decorator="decorators.mounted_models"
            resource="llm_instant_models"
            remote
            :params="mountedModelParams"
            :selectProps="{ mode: 'multiple', placeholder: $t('common.tips.select', [$t('aice.model')]), allowClear: true }" />
        </a-form-item>
        <a-form-item :label="$t('aice.devices')" :extra="$t('aice.llm_override_sku_extra')">
          <base-select
            v-decorator="decorators.device"
            :options="specList"
            :selectProps="{ mode: 'multiple', placeholder: $t('common.tips.select', [$t('aice.devices')]), allowClear: true }" />
        </a-form-item>
        <a-form-item :label="$t('aice.host_paths')" :extra="$t('aice.llm_override_sku_extra')">
          <div v-for="hp in hostPathRows" :key="hp.key" style="display: flex; align-items: stretch; gap: 10px; margin-bottom: 12px;">
            <div style="flex: 1; border: 1px solid #e8e8e8; border-radius: 4px; padding: 12px;">
              <a-row :gutter="8">
                <a-col :span="8">
                  <a-form-item>
                    <fixed-label-filter :label="$t('aice.host_paths.type')">
                      <a-select v-decorator="decorators.host_paths.type(hp.key)" :placeholder="$t('common.tips.select', [$t('aice.host_paths.type')])">
                        <a-select-option value="directory">directory</a-select-option>
                        <a-select-option value="file">file</a-select-option>
                      </a-select>
                    </fixed-label-filter>
                  </a-form-item>
                </a-col>
                <a-col :span="16">
                  <a-form-item>
                    <fixed-label-filter :label="$t('aice.host_paths.path')">
                      <a-input v-decorator="decorators.host_paths.path(hp.key)" :placeholder="$t('aice.host_paths.path.placeholder')" />
                    </fixed-label-filter>
                  </a-form-item>
                </a-col>
              </a-row>

              <a-row :gutter="8">
                <a-col :span="24">
                  <a-form-item>
                    <a-checkbox v-decorator="decorators.host_paths.auto_create(hp.key)">{{ $t('aice.host_paths.auto_create') }}</a-checkbox>
                  </a-form-item>
                </a-col>
              </a-row>
              <a-row :gutter="8" v-if="form.fc.getFieldValue(`host_path_auto_create_${hp.key}`)">
                <a-col :span="8">
                  <a-form-item>
                    <fixed-label-filter :label="$t('aice.host_paths.auto_create_config.uid')">
                      <a-input v-decorator="decorators.host_paths.auto_uid(hp.key)" :placeholder="$t('aice.host_paths.auto_create_config.uid.placeholder')" />
                    </fixed-label-filter>
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item>
                    <fixed-label-filter :label="$t('aice.host_paths.auto_create_config.gid')">
                      <a-input v-decorator="decorators.host_paths.auto_gid(hp.key)" :placeholder="$t('aice.host_paths.auto_create_config.gid.placeholder')" />
                    </fixed-label-filter>
                  </a-form-item>
                </a-col>
                <a-col :span="8">
                  <a-form-item>
                    <fixed-label-filter :label="$t('aice.host_paths.permissions')">
                      <a-input v-decorator="decorators.host_paths.auto_perm(hp.key)" :placeholder="$t('aice.host_paths.permissions.placeholder')" />
                    </fixed-label-filter>
                  </a-form-item>
                </a-col>
              </a-row>

              <div style="margin: 8px 0; font-weight: 500;">{{ $t('aice.host_paths.containers') }}</div>
              <div v-for="c in hp.containerRows" :key="c.key">
                <a-row :gutter="8">
                  <a-col :span="12">
                    <a-form-item>
                      <fixed-label-filter :label="$t('aice.host_paths.mount_path')">
                        <a-input v-decorator="decorators.host_paths.mount_path(hp.key, c.key)" :placeholder="$t('aice.host_paths.mount_path.placeholder')" />
                      </fixed-label-filter>
                    </a-form-item>
                  </a-col>
                  <a-col :span="12">
                    <a-form-item>
                      <fixed-label-filter :label="$t('aice.host_paths.propagation')">
                        <a-select v-decorator="decorators.host_paths.propagation(hp.key, c.key)" :placeholder="$t('common.tips.select', [$t('aice.host_paths.propagation')])" optionLabelProp="label" :dropdownMatchSelectWidth="false">
                          <a-select-option value="private" label="private">private - {{ $t('aice.host_paths.propagation.private') }}</a-select-option>
                          <a-select-option value="rslave" label="rslave">rslave - {{ $t('aice.host_paths.propagation.rslave') }}</a-select-option>
                          <a-select-option value="rshared" label="rshared">rshared - {{ $t('aice.host_paths.propagation.rshared') }}</a-select-option>
                        </a-select>
                      </fixed-label-filter>
                    </a-form-item>
                  </a-col>
                </a-row>
                <a-row :gutter="8">
                  <a-col :span="4">
                    <a-form-item>
                      <a-checkbox v-decorator="decorators.host_paths.read_only(hp.key, c.key)">{{ $t('aice.host_paths.read_only') }}</a-checkbox>
                    </a-form-item>
                  </a-col>
                </a-row>
              </div>
            </div>

            <div style="width: 34px; display: flex; align-items: center; justify-content: center;">
              <a-button shape="circle" icon="minus" size="small" @click="delHostPath(hp)" />
            </div>
          </div>

          <div class="d-flex align-items-center">
            <a-button type="primary" shape="circle" icon="plus" size="small" @click="addHostPath" />
            <a-button type="link" @click="addHostPath">{{ $t('aice.host_paths.add') }}</a-button>
          </div>
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
import { uuid } from '@/utils/utils'
import { getParamsForType } from '../../llm-sku/llmTypeConfig'

export default {
  name: 'LlmUpdateConfigDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const row = (this.params.data && this.params.data[0]) || {}
    const isApplyType = this.$route.path.includes('app-llm')
    const devices = Array.isArray(row.devices) ? row.devices : []
    // 详情响应的字段名是 mounted_model_infos（来自 LLMListDetails.MountedModelInfos）；
    // 编辑时回填这些已挂载模型的 id 作为 select 的 initialValue。
    const mountedModels = Array.isArray(row.mounted_model_infos) ? row.mounted_model_infos : []
    const hostPaths = Array.isArray(row.host_paths) ? row.host_paths : []
    const hostPathRows = hostPaths.map(hp => {
      const containers = hp && hp.containers && typeof hp.containers === 'object' ? hp.containers : {}
      const containerRows = Object.keys(containers).map(k => ({
        key: uuid(),
        containerIndex: String(k),
        ...(containers[k] || {}),
      }))
      return {
        key: uuid(),
        ...hp,
        containerRows: containerRows.length ? containerRows : [{ key: uuid() }],
      }
    })
    const getHostPathRow = rowKey => hostPathRows.find(hp => hp.key === rowKey)
    const getHostPathContainerRow = (hpKey, cKey) => {
      const hp = getHostPathRow(hpKey)
      return hp && Array.isArray(hp.containerRows) ? hp.containerRows.find(c => c.key === cKey) : undefined
    }
    return {
      row,
      isApplyType,
      loading: false,
      hostPathRows,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach(key => {
              this.$set(this.form.fd, key, values[key])
            })
          },
        }),
        fd: {},
      },
      decorators: {
        device: [
          'device',
          {
            initialValue: devices.map(v => v.model),
          },
        ],
        mounted_models: [
          'mounted_models',
          {
            initialValue: mountedModels.map(v => v.id),
          },
        ],
        host_paths: {
          type: rowKey => [
            `host_path_type_${rowKey}`,
            { initialValue: getHostPathRow(rowKey)?.type || 'directory' },
          ],
          path: rowKey => [
            `host_path_path_${rowKey}`,
            {
              initialValue: getHostPathRow(rowKey)?.path,
              rules: [{ required: true, message: this.$t('aice.host_paths.path.required') }],
            },
          ],
          auto_create: rowKey => [
            `host_path_auto_create_${rowKey}`,
            { valuePropName: 'checked', initialValue: !!getHostPathRow(rowKey)?.auto_create },
          ],
          auto_uid: rowKey => [
            `host_path_auto_uid_${rowKey}`,
            { initialValue: getHostPathRow(rowKey)?.auto_create_config?.uid },
          ],
          auto_gid: rowKey => [
            `host_path_auto_gid_${rowKey}`,
            { initialValue: getHostPathRow(rowKey)?.auto_create_config?.gid },
          ],
          auto_perm: rowKey => [
            `host_path_auto_perm_${rowKey}`,
            { initialValue: getHostPathRow(rowKey)?.auto_create_config?.permissions },
          ],
          container_index: (hpKey, cKey) => [
            `host_path_container_index_${hpKey}__${cKey}`,
            { initialValue: getHostPathContainerRow(hpKey, cKey)?.containerIndex ?? 0 },
          ],
          mount_path: (hpKey, cKey) => [
            `host_path_mount_path_${hpKey}__${cKey}`,
            {
              initialValue: getHostPathContainerRow(hpKey, cKey)?.mount_path,
              rules: [{ required: true, message: this.$t('aice.host_paths.mount_path.required') }],
            },
          ],
          read_only: (hpKey, cKey) => [
            `host_path_read_only_${hpKey}__${cKey}`,
            { valuePropName: 'checked', initialValue: !!getHostPathContainerRow(hpKey, cKey)?.read_only },
          ],
          propagation: (hpKey, cKey) => [
            `host_path_propagation_${hpKey}__${cKey}`,
            { initialValue: getHostPathContainerRow(hpKey, cKey)?.propagation || 'rslave' },
          ],
        },
      },
      formItemLayout: {
        wrapperCol: { span: 20 },
        labelCol: { span: 4 },
      },
    }
  },
  computed: {
    specList () {
      const list = Object.values(this.$store.getters.capability?.pci_model_types || {}).filter(item => item.hypervisor === 'pod')
      return list.map(item => ({ key: item.model, label: item.model }))
    },
    supportMountedModels () {
      return ['ollama', 'vllm'].includes((this.row.llm_type || '').toLowerCase())
    },
    mountedModelParams () {
      return {
        limit: 20,
        scope: this.$store.getters.scope,
        ...getParamsForType(this.row.llm_type),
      }
    },
  },
  methods: {
    addHostPath () {
      this.hostPathRows.push({ key: uuid(), containerRows: [{ key: uuid() }] })
    },
    delHostPath (hp) {
      const idx = this.hostPathRows.findIndex(v => v.key === hp.key)
      if (idx >= 0) this.hostPathRows.splice(idx, 1)
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const data = {}
        data.devices = Array.isArray(values.device) ? values.device.map(k => ({ model: k })) : []
        if (this.supportMountedModels) {
          data.mounted_models = Array.isArray(values.mounted_models) ? values.mounted_models : []
        }
        data.host_paths = this.hostPathRows.map(hp => {
          const hpKey = hp.key
          const type = values[`host_path_type_${hpKey}`]
          const path = values[`host_path_path_${hpKey}`]
          const autoCreate = !!values[`host_path_auto_create_${hpKey}`]
          const out = { type, path }
          if (autoCreate) {
            out.auto_create = true
            const uid = values[`host_path_auto_uid_${hpKey}`]
            const gid = values[`host_path_auto_gid_${hpKey}`]
            const perm = values[`host_path_auto_perm_${hpKey}`]
            const cfg = {}
            if (uid !== undefined && uid !== null && uid !== '') cfg.uid = uid
            if (gid !== undefined && gid !== null && gid !== '') cfg.gid = gid
            if (perm != null && String(perm).trim() !== '') cfg.permissions = String(perm).trim()
            if (Object.keys(cfg).length > 0) out.auto_create_config = cfg
          }
          const containers = {}
          ;(hp.containerRows || []).forEach(c => {
            const composite = `${hpKey}__${c.key}`
            const idx = values[`host_path_container_index_${composite}`]
            const mountPath = values[`host_path_mount_path_${composite}`]
            if (idx == null || mountPath == null || String(mountPath).trim() === '') return
            const k = String(idx).trim()
            if (!k) return
            const m = { mount_path: String(mountPath).trim(), read_only: !!values[`host_path_read_only_${composite}`] }
            const prop = values[`host_path_propagation_${composite}`]
            if (prop != null && String(prop).trim() !== '') m.propagation = String(prop).trim()
            containers[k] = m
          })
          if (Object.keys(containers).length > 0) out.containers = containers
          return out
        }).filter(v => v && v.type && v.path)
        await this.params.onManager('update', {
          id: this.row.id,
          managerArgs: { data },
        })
        this.$message.success(this.$t('common.success'))
        this.cancelDialog()
        this.params.refresh && this.params.refresh()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
