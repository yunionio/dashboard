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
        <a-form-item label="llm_image_id">
          <base-select
            v-decorator="decorators.llm_image_id"
            resource="llm_images"
            :params="appImageParams"
            :selectProps="{ placeholder: $t('common.tips.select', ['llm_image_id']) }" />
        </a-form-item>
        <a-form-item label="llm_type">
          <base-select
            v-decorator="decorators.llm_type"
            :options="llmTypeOptions"
            :selectProps="{ placeholder: $t('common.tips.select', ['llm_type']) }" />
        </a-form-item>
        <a-form-item :label="$t('aice.model_name')">
          <a-input v-decorator="decorators.llm_model_name" :placeholder="$t('common.tips.input', [$t('aice.model_name')])" />
        </a-form-item>
        <a-form-item :label="$t('common.network.type')" prop="network_type">
          <a-radio-group v-decorator="decorators.network_type">
            <a-radio-button value="guest">{{ $t('networkServerType.guest') }}</a-radio-button>
            <a-radio-button value="hostlocal">{{ $t('networkServerType.hostlocal') }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('cloudenv.text_7')" prop="network_id">
          <base-select
            v-decorator="decorators.network_id"
            resource="networks"
            :params="networkParams"
            :selectProps="{ placeholder: $t('common.tips.select', [$t('cloudenv.text_7')]) }" />
        </a-form-item>
        <!-- <a-form-item label="audio_image_id">
          <base-select
            v-decorator="decorators.audio_image_id"
            resource="llm_images"
            :params="audioImageParams"
            :selectProps="{ placeholder: $t('common.tips.select', ['audio_image_id']) }" />
        </a-form-item>
        <a-form-item label="stream_image_id">
          <base-select
            v-decorator="decorators.stream_image_id"
            resource="llm_images"
            :params="streamImageParams"
            :selectProps="{ placeholder: $t('common.tips.select', ['stream_image_id']) }" />
        </a-form-item> -->
        <a-form-item label="CPU">
          <a-input-number
            v-decorator="decorators.cpu"
            :min="2"
            :step="2"
            :precision="0" /> {{ $t('aice.cpu.unit') }}
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
            <!-- <a-col :span="8">
              <base-select
                v-decorator="decorators.volume_storage_type"
                :options="dict.diskTypeArr" />
            </a-col> -->
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
            :min="100"
            :step="100"
            :precision="0" /> Mbps
        </a-form-item>
        <!-- <a-form-item :label="$t('aice.image')">
          <base-select
            v-decorator="decorators.phone_image"
            resource="llm_images"
            :selectProps="{ placeholder: $t('common.tips.select', [$t('aice.image')]) }" />
        </a-form-item> -->
        <!-- <a-form-item :label="$t('aice.request_sync_image')" v-if="isEditMode">
          <a-checkbox v-decorator="decorators.request_sync_image">
            {{$t('aice.request_sync_image.prompt')}}
          </a-checkbox>
        </a-form-item> -->
        <a-form-item :label="$t('aice.port')">
          <a-row v-for="item in portMappings" :key="item.key" :gutter="4">
            <a-col :span="8" v-if="item.showKey">
              <a-form-item>
                <a-input
                  v-decorator="decorators.port_mappping.showKey(item.key)" disabled />
              </a-form-item>
            </a-col>
            <a-col :span="item.showKey ? 8 : 11">
              <a-form-item>
                <base-select
                  v-decorator="decorators.port_mappping.protocol(item.key)"
                  :options="dict.protocolArr" />
              </a-form-item>
            </a-col>
            <a-col :span="item.showKey ? 8 : 11">
              <a-form-item>
                <a-input
                  v-decorator="decorators.port_mappping.first_port_offset(item.key)"
                  :placeholder="$t('common.tips.input', [$t('aice.port')])" />
              </a-form-item>
            </a-col>
            <!-- <a-col :span="2" v-if="params.type !== 'edit'">
              <a-button shape="circle" icon="minus" size="small" @click="del(item)" class="mt-2 ml-2" />
            </a-col> -->
          </a-row>
          <!-- <a-row v-if="params.type !== 'edit'">
            <a-col>
              <div class="d-flex align-items-center">
                <a-button type="primary" shape="circle" icon="plus" size="small" @click="add" />
                <a-button type="link" @click="add">{{$t('aice.add', [$t('aice.port')])}}</a-button>
              </div>
            </a-col>
          </a-row> -->
        </a-form-item>
        <a-form-item :label="$t('aice.devices')">
          <base-select
            v-decorator="decorators.device"
            :options="specList"
            :selectProps="{ placeholder: $t('common.tips.select', [$t('aice.devices')]) }" />
        </a-form-item>
        <!-- <a-form-item :label="$t('aice.mounted_apps')">
          <base-select
            v-decorator="decorators.mounted_apps"
            resource="llm_instant_models"
            :mapper="mounted_apps_mapper"
            :selectProps="{ mode: 'multiple', placeholder: $t('common.tips.select', [$t('aice.mounted_apps')]) }" />
        </a-form-item> -->
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
import { mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import DomainProject from '@/sections/DomainProject'
import NameRepeated from '@/sections/NameRepeated'
import { isRequired } from '@/utils/validate'
import { uuid } from '@/utils/utils'
import { dict, portMappings } from '../constant'

const getInitVal = (list, key, property) => {
  const target = list.filter(item => item.key === key)
  return target.length ? target[0][property] : ''
}

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
      bandwidth = 100,
      image_id,
      envs = [],
      port_mappings = portMappings,
      llm_image_id,
      llm_model_name,
      network_type,
      network_id,
      // audio_image_id,
      // stream_image_id,
      devices,
      mounted_apps,
    } = data
    port_mappings.sort((a, b) => a.first_port_offset - b.first_port_offset)
    const portMappingss = port_mappings.map(item => ({ ...item, key: uuid(), showKey: item.envs[0].key }))
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
          network_type: network_type || 'guest',
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
              { required: true, message: this.$t('common.tips.select', ['llm_image_id']) },
            ],
          },
        ],
        llm_type: [
          'llm_type',
          {
            initialValue: 'ollama',
            rules: [
              { required: true, message: this.$t('common.tips.select', ['llm_type']) },
            ],
          },
        ],
        llm_model_name: [
          'llm_model_name',
          {
            initialValue: llm_model_name,
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('aice.model_name')]) },
            ],
          },
        ],
        // audio_image_id: [
        //   'audio_image_id',
        //   {
        //     initialValue: audio_image_id,
        //     rules: [
        //       { required: true, message: this.$t('common.tips.select', ['audio_image_id']) },
        //     ],
        //   },
        // ],
        // stream_image_id: [
        //   'stream_image_id',
        //   {
        //     initialValue: stream_image_id,
        //     rules: [
        //       { required: true, message: this.$t('common.tips.select', ['stream_image_id']) },
        //     ],
        //   },
        // ],
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
        network_type: [
          'network_type',
          {
            initialValue: network_type || 'guest',
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('common.network.type')]) },
            ],
          },
        ],
        network_id: [
          'network_id',
          {
            initialValue: network_id,
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('cloudenv.text_7')]) },
            ],
          },
        ],
        // volume_storage_type: [
        //   'volume_storage_type',
        //   {
        //     initialValue: volume.storage_type,
        //   },
        // ],
        volume_size: [
          'volume_size',
          {
            initialValue: volume.size / 1024,
          },
        ],
        bandwidth: [
          'bandwidth',
          {
            initialValue: bandwidth,
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
        port_mappping: {
          protocol: i => [
            `protocol[${i}]`,
            {
              initialValue: getInitVal(portMappingss, i, 'protocol'),
            },
          ],
          showKey: i => [
            `showKey[${i}]`,
            {
              initialValue: getInitVal(portMappingss, i, 'showKey'),
            },
          ],
          first_port_offset: i => [
            `first_port_offset[${i}]`,
            {
              initialValue: getInitVal(portMappingss, i, 'first_port_offset'),
              rules: [
                { type: 'number', min: 0, max: 65535, message: this.$t('aice.container_port.message'), trigger: 'blur', transform: (v) => parseInt(v) },
              ],
            },
          ],
        },
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
      portMappings: portMappingss,
      envVars,
      projectName: `${project_domain}/${tenant}`,
      modelName: name,
      appImageParams: {
        limit: 20,
        scope: this.$store.getters.scope,
        $t: 1,
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
    networkParams () {
      return {
        scope: this.$store.getters.scope,
        limit: 20,
        server_type: this.form.fd.network_type,
      }
    },
    isEditMode () {
      return this.params.type === 'edit'
    },
    specList () {
      const list = Object.values(this.$store.getters.capability?.specs?.isolated_devices || {}).filter(item => item.hypervisor === 'pod')
      return list.map(item => ({
        key: item.model,
        label: item.model,
      }))
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
    add () {
      this.portMappings.push({ key: uuid() })
    },
    del (item) {
      const idx = this.portMappings.findIndex(v => v.key === item.key)
      this.portMappings.splice(idx, 1)
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
          bandwidth,
          first_port_offset,
          showKey,
          cpu,
          memory,
          name,
          phone_image,
          request_sync_image,
          protocol,
          volume_size,
          llm_image_id,
          llm_type,
          llm_model_name,
          // audio_image_id,
          // stream_image_id,
          network_id,
          network_type,
          device,
          mounted_apps,
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
        const port_mappings = this.portMappings.map(item => {
          const s = {
            protocol: protocol[item.key],
            first_port_offset: first_port_offset[item.key],
            envs: R.clone(item.envs),
            container_port: item.container_port,
          }
          if (s.envs && s.envs[0]) {
            s.envs[0].key = showKey[item.key]
          }
          return s
        })
        const data = {
          name,
          llm_image_id,
          llm_type,
          llm_model_name,
          // audio_image_id,
          // stream_image_id,
          bandwidth,
          image_id: phone_image,
          cpu,
          memory: memory * 1024,
          volumes,
          disk_size: volumes[0].size_mb,
          port_mappings,
          network_id,
          network_type,
          app_type: 'steam',
          devices: [
            { model: device },
          ],
          mounted_apps,
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
