<template>
  <base-dialog :width="900" @cancel="cancelDialog">
    <div slot="header">{{ params.type === 'edit' ? $t('table.action.modify') : $t('common.create') }}</div>
    <div slot="body">
      <a-form :form="form.fc" v-bind="formItemLayout" hideRequiredMark>
        <a-form-item :label="$t('aice.project')">
          <domain-project
            v-if="!isEditMode"
            :fc="form.fc"
            :fd="form.fd"
            :form-layout="formItemLayout"
            :decorators="{ project: decorators.project, domain: decorators.domain }" />
          <a-label v-if="isEditMode">{{ projectName }}</a-label>
        </a-form-item>
        <a-form-item :label="$t('common.name')">
          <a-input v-decorator="decorators.name" v-if="!isEditMode" />
          <template v-slot:extra v-if="!isEditMode">
            <name-repeated res="llm_skus" :name="form.fd.name" :default-text="$t('aice.name_repeat_extra')" />
          </template>
          <a-label v-if="isEditMode">{{ modelName }}</a-label>
        </a-form-item>
        <a-form-item :label="$t('aice.llm_type')">
          <base-select
            v-decorator="decorators.llm_type"
            :options="llmTypeOptions"
            :selectProps="{ placeholder: $t('common.tips.select', [$t('aice.llm_type')]) }" />
        </a-form-item>
        <a-form-item :label="$t('aice.llm_image')">
          <base-select
            v-decorator="decorators.llm_image_id"
            resource="llm_images"
            :params="appImageParams"
            :selectProps="{ placeholder: $t('common.tips.select', [$t('aice.llm_image')]) }" />
        </a-form-item>
        <a-form-item :label="$t('aice.model')">
          <base-select
            v-decorator="decorators.mounted_models"
            resource="llm_instant_models"
            remote
            :params="mountedModelParams"
            :selectProps="{ placeholder: $t('common.tips.select', [$t('aice.model')]), mode: 'multiple' }" />
        </a-form-item>
        <a-form-item label="CPU">
          <a-input-number
            v-decorator="decorators.cpu"
            :min="2"
            :step="2"
            :precision="0" /> {{ $t('aice.cpu.unit') }}
        </a-form-item>
        <a-form-item :label="$t('aice.devices')">
          <base-select
            v-decorator="decorators.device"
            :options="specList"
            :selectProps="{ placeholder: $t('common.tips.select', [$t('aice.devices')]) }" />
        </a-form-item>
        <a-form-item :label="$t('aice.memory')">
          <a-input-number
            v-decorator="decorators.memory"
            :min="2"
            :step="2"
            :precision="0" /> GB
        </a-form-item>
        <a-form-item :label="$t('aice.disk')">
          <a-row :gutter="4">
            <a-col :span="5">
              <a-input-number
                v-decorator="decorators.volume_size"
                :min="32"
                :step="32"
                :precision="0" /> GB
            </a-col>
          </a-row>
        </a-form-item>
        <a-form-item :label="$t('aice.bandwidth')">
          <a-input-number
            v-decorator="decorators.bandwidth"
            :min="1"
            :max="10000"
            :step="1"
            :precision="0" /> MB
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
import DomainProject from '@/sections/DomainProject'
import NameRepeated from '@/sections/NameRepeated'
import { isRequired } from '@/utils/validate'
import { uuid } from '@/utils/utils'
import { dict } from '../constant'

export default {
  name: 'LlmSkuCreateDialog',
  components: {
    DomainProject,
    NameRepeated,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const data = this.params.type === 'edit' ? this.params.data[0] : {}
    const {
      domain_id,
      project_domain,
      tenant_id,
      tenant,
      name,
      cpu = 2,
      memory = 2048,
      volume = { size: 102400, storage_type: 'local', template_id: undefined },
      image_id,
      envs = [],
      llm_image_id,
      // audio_image_id,
      // stream_image_id,
      devices,
      mounted_models = [],
      mounted_apps = [],
    } = data
    const envVars = envs.map(item => ({ env_key: item.key, env_value: item.value, key: uuid() }))
    return {
      loading: false,
      dict,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.$set(this.form.fd, key, values[key])
            })
          },
        }),
        fd: {
        },
      },
      decorators: {
        domain: [
          'domain',
          {
            initialValue: { key: domain_id, label: project_domain },
            rules: [
              { validator: isRequired(), message: this.$t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        project: [
          'project',
          {
            initialValue: { key: tenant_id, label: tenant },
            rules: [
              { validator: isRequired(), message: this.$t('rules.project'), trigger: 'change' },
            ],
          },
        ],
        name: [
          'name',
          {
            initialValue: name,
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('common.name')]) },
            ],
          },
        ],
        llm_image_id: [
          'llm_image_id',
          {
            initialValue: llm_image_id,
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.llm_image')]) },
            ],
          },
        ],
        llm_type: [
          'llm_type',
          {
            initialValue: 'ollama',
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.llm_type')]) },
            ],
          },
        ],
        mounted_models: [
          'mounted_models',
          {
            initialValue: mounted_models.map(v => v.id),
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.model')]) },
            ],
          },
        ],
        bandwidth: [
          'bandwidth',
          {
            initialValue: 100,
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('aice.bandwidth')]) },
            ],
          },
        ],
        cpu: [
          'cpu',
          {
            initialValue: cpu,
            rules: [
              { required: true, message: this.$t('common.tips.input', ['CPU']) },
            ],
          },
        ],
        memory: [
          'memory',
          {
            initialValue: memory / 1024,
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('aice.memory')]) },
            ],
          },
        ],
        volume_size: [
          'volume_size',
          {
            initialValue: volume.size / 1024,
          },
        ],
        phone_image: [
          'phone_image',
          {
            initialValue: image_id,
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.image')]) },
            ],
          },
        ],
        request_sync_image: [
          'request_sync_image',
          {
            initialValue: false,
          },
        ],
        device: [
          'device',
          {
            initialValue: devices && devices[0]?.model,
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.devices')]) },
            ],
          },
        ],
        mounted_apps: [
          'mounted_apps',
          {
            initialValue: mounted_apps,
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 5,
        },
      },
      envVars,
      projectName: `${project_domain}/${tenant}`,
      modelName: name,
      appImageParams: {
        limit: 20,
        scope: this.$store.getters.scope,
        $t: 1,
        llm_type: 'ollama',
      },
      audioImageParams: {
        limit: 20,
        scope: this.$store.getters.scope,
        $t: 2,
      },
      streamImageParams: {
        limit: 20,
        scope: this.$store.getters.scope,
        $t: 3,
      },
      llmTypeOptions: [
        { id: 'ollama', name: 'Ollama' },
      ],
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    isEditMode () {
      return this.params.type === 'edit'
    },
    specList () {
      const list = Object.values(this.$store.getters.capability?.pci_model_types || {}).filter(item => item.hypervisor === 'pod')
      return list.map(item => ({
        key: item.model,
        label: item.model,
      }))
    },
    mountedModelParams () {
      return {
        limit: 20,
        scope: this.$store.getters.scope,
        llm_type: 'ollama',
      }
    },
  },
  methods: {
    mounted_apps_mapper (list) {
      return list.map((item, index) => {
        return {
          id: `${item.app_id}/${item.version}`,
          name: `${item.package}/${item.version}`,
        }
      })
    },
    add_env () {
      this.envVars.push({ key: uuid() })
    },
    del_env (item) {
      const idx = this.envVars.findIndex(v => v.key === item.key)
      this.envVars.splice(idx, 1)
    },
    async handleConfirm () {
      this.loading = true
      try {
        const manager = new this.$Manager('llm_skus')
        const values = await this.form.fc.validateFields()
        const {
          project,
          cpu,
          memory,
          name,
          phone_image,
          request_sync_image,
          volume_size,
          llm_image_id,
          llm_type,
          mounted_models,
          bandwidth,
          // audio_image_id,
          // stream_image_id,
          device,
        } = values

        const volumes = [{
          containers: this.params.type === 'edit' ? this.params.data[0].volumes[0].containers : {
            1: {
              mount_path: '/etc/wolf',
              sub_directory: 'wolf',
            },
            2: {
              mount_path: '/home/retro',
              sub_directory: 'home',
              overlay: {
                lower_dir: [
                  '/opt/steam-data/steam',
                  '/opt/steam-data/games',
                ],
                use_disk_image: false,
              },
            },
          },
          size_mb: volume_size * 1024,
        }]
        const data = {
          name,
          llm_image_id,
          llm_type,
          mounted_models,
          bandwidth,
          // audio_image_id,
          // stream_image_id,
          image_id: phone_image,
          cpu,
          memory: memory * 1024,
          volumes,
          disk_size: volumes[0].size_mb,
          app_type: 'steam',
          devices: [
            { model: device },
          ],
        }
        if (this.params.type === 'edit') {
          if (request_sync_image) {
            data.request_sync_image = true
          }
          await this.params.onManager('update', {
            id: this.params.data[0].id,
            managerArgs: {
              data,
            },
          })
        } else {
          data.generate_name = name
          data.project_id = project?.key || this.userInfo.projectId
          await manager.create({
            data,
          })
        }
        this.params.callback && this.params.callback()
        this.cancelDialog()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
