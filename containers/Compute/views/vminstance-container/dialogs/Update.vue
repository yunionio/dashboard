<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('compute.container', [])" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form :form="form.fc" hideRequiredMark v-bind="formItemLayout">
        <a-form-item :label="$t('compute.repo.edit_mode')">
          <a-radio-group v-model="editMode">
            <a-radio-button value="custom">{{ $t('compute.repo.edit_mode.custom') }}</a-radio-button>
            <a-radio-button value="yaml">{{ $t('compute.repo.edit_mode.yaml') }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <template v-if="editMode === 'custom'">
          <a-form-item :label="$t('compute.repo.image.source')">
            <a-radio-group :value="source" @change="handleSourceChange">
              <a-radio-button value="custom">{{ $t('compute.repo.image.custom') }}</a-radio-button>
              <a-radio-button value="registry">{{ $t('compute.repo.image.registry') }}</a-radio-button>
              <a-radio-button value="container_image">{{ $t('compute.repo.image.container_image') }}</a-radio-button>
            </a-radio-group>
          </a-form-item>
          <a-form-item v-if="source === 'custom'" :label="$t('compute.repo.container_image')">
            <a-input
              v-decorator="decorators.image"
              :placeholder="$t('common.tips.input', [$t('compute.repo.container_image')])" />
          </a-form-item>
          <a-form-item v-else-if="source === 'registry'" :label="$t('compute.repo.container_image')">
            <mirror-registry v-decorator="decorators.registryImage" @credential-change="handleCredentialChange" />
            <a-input v-show="false" v-decorator="decorators.imageCredentialId" />
          </a-form-item>
          <a-form-item v-else :label="$t('compute.repo.container_image')">
            <a-select
              v-decorator="decorators.containerImageId"
              showSearch
              :filterOption="filterOption"
              :loading="containerImageLoading"
              :placeholder="$t('common.tips.select', [$t('compute.repo.image.container_image')])"
              allowClear>
              <a-select-option
                v-for="img in containerImages"
                :key="img.value"
                :value="img.value"
                :label="img.label">
                <div>{{ img.label }}</div>
                <div style="font-size: 12px; color: #999;">{{ img.ref }}</div>
              </a-select-option>
            </a-select>
            <div v-if="!containerImageLoading && containerImages.length === 0" class="mt-2">
              <a-alert type="info" show-icon>
                <template slot="message">
                  {{ $t('compute.repo.image.container_image.empty_tip') }}
                  <router-link to="/container_image">{{ $t('compute.repo.image.container_image.manage') }}</router-link>
                </template>
              </a-alert>
            </div>
          </a-form-item>
          <a-form-item :label="$t('compute.repo.command')">
            <a-input v-decorator="decorators.command" :placeholder="$t('compute.repo.command.placeholder')" />
          </a-form-item>
          <a-form-item :label="$t('compute.repo.command.params')">
            <a-input v-decorator="decorators.arg" :placeholder="$t('compute.repo.command.params.placeholder')" />
          </a-form-item>
          <a-form-item :label="$t('compute.repo.env_variables')">
            <labels ref="envRef" :decorators="decorators.env(0)" :title="$t('compute.repo.variables')" :keyLabel="$t('compute.repo.variables')" />
          </a-form-item>
          <a-form-item :label="$t('compute.repo.capabilities.add')">
            <a-select
              v-decorator="decorators.capAdd"
              mode="multiple"
              :placeholder="$t('compute.repo.capabilities.add.placeholder')"
              optionLabelProp="label"
              allowClear>
              <a-select-option v-for="cap in capabilityOptions" :key="cap.value" :value="cap.value" :label="cap.label">
                <span>{{ cap.label }}</span>
                <span style="color: rgba(0,0,0,.45); margin-left: 8px; font-size: 12px;">{{ cap.description }}</span>
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item :label="$t('compute.repo.capabilities.drop')">
            <a-select
              v-decorator="decorators.capDrop"
              mode="multiple"
              :placeholder="$t('compute.repo.capabilities.drop.placeholder')"
              optionLabelProp="label"
              allowClear>
              <a-select-option v-for="cap in capabilityOptions" :key="cap.value" :value="cap.value" :label="cap.label">
                <span>{{ cap.label }}</span>
                <span style="color: rgba(0,0,0,.45); margin-left: 8px; font-size: 12px;">{{ cap.description }}</span>
              </a-select-option>
            </a-select>
          </a-form-item>
          <a-form-item label="">
            <a-checkbox v-decorator="decorators.privileged">{{$t('compute.repo.privileged_mode')}}</a-checkbox>
          </a-form-item>
        </template>
        <template v-else>
          <a-form-item :label="$t('compute.yaml_config')">
            <div class="yaml-config-wrapper">
              <code-mirror v-decorator="decorators.yaml" :options="cmOptions" />
            </div>
          </a-form-item>
        </template>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import jsYaml from 'js-yaml'
import MirrorRegistry from '@Compute/sections/MirrorRegistry'
import Labels from '@Compute/sections/Labels'
import { CAPABILITY_OPTIONS } from '@Compute/views/vminstance-container/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { validateYaml } from '@/utils/validate'
export default {
  name: 'ContainerUpdateDialog',
  components: {
    MirrorRegistry,
    Labels,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const specData = this.params.data[0].spec || {}
    let initialSource = 'custom'
    if (specData.container_image_id) {
      initialSource = 'container_image'
    } else if (specData.image_credential_id) {
      initialSource = 'registry'
    }

    return {
      loading: false,
      action: this.$t('common.edit'),
      source: initialSource,
      editMode: 'custom',
      containerImageLoading: false,
      containerImages: [],
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.$set(this.form.fd, key, values[key])
            })
          },
        }),
        fd: {},
      },
      cmOptions: {
        tabSize: 2,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        mode: 'text/x-yaml',
        theme: 'material',
      },
      decorators: {
        registryImage: [
          'registryImage',
          {
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('compute.eci.repo.image.registry')]) },
            ],
          },
        ],
        imageCredentialId: [
          'imageCredentialId',
          {
            initialValue: specData.image_credential_id,
          },
        ],
        containerImageId: [
          'containerImageId',
          {
            initialValue: specData.container_image_id,
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('compute.repo.image.container_image')]) },
            ],
          },
        ],
        image: [
          'image',
          {
            initialValue: specData.image,
            rules: [
              { required: true, message: `${this.$t('common.placeholder')}${this.$t('compute.repo.container_image')}` },
            ],
          },
        ],
        command: [
          'command',
          {
            initialValue: specData.command?.join(' '),
          },
        ],
        arg: [
          'arg',
          {
            initialValue: specData.args?.join(' '),
          },
        ],
        env: i => ({
          key: j => [
            `envNames[${i}][${j}]`,
            {
              rules: [
                { required: true, message: this.$t('common.tips.input', [this.$t('compute.repo.variables')]) },
              ],
            },
          ],
          value: j => [
            `envValues[${i}][${j}]`,
            {
              rules: [
                { required: true, message: this.$t('common.tips.input', [this.$t('compute.repo.value')]) },
              ],
            },
          ],
        }),
        capAdd: [
          'capAdd',
          {
            initialValue: specData.capabilities?.add || [],
          },
        ],
        capDrop: [
          'capDrop',
          {
            initialValue: specData.capabilities?.drop || [],
          },
        ],
        privileged: [
          'privileged',
          {
            valuePropName: 'checked',
            initialValue: specData.privileged,
          },
        ],
        yaml: [
          'yaml',
          {
            validateFirst: true,
            initialValue: jsYaml.safeDump(this.params.data[0]),
            rules: [
              { required: true, message: this.$t('common.tips.input', ['Yaml']) },
              {
                validator: (rule, value, _callback) => {
                  validateYaml(value)
                    .then(() => {
                      return _callback()
                    })
                    .catch(() => {
                      return _callback(this.$t('compute.yaml_check_tip'))
                    })
                },
              },
            ],
          },
        ],
      },
      capabilityOptions: CAPABILITY_OPTIONS,
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
    }
  },
  computed: {
    columns () {
      const showFields = ['name', 'status']
      return this.params.columns.filter((item) => { return showFields.includes(item.field) })
    },
    selectItems () {
      return this.params.data
    },
  },
  watch: {
    source (val) {
      if (val === 'container_image' && this.containerImages.length === 0) {
        this.fetchContainerImages()
      }
    },
  },
  mounted () {
    if (this.source === 'container_image') {
      this.fetchContainerImages()
    }
    setTimeout(() => {
      const envs = this.selectItems[0].spec?.envs || []

      envs.forEach((v, idx) => {
        this.$refs.envRef.add()
        this.$nextTick(() => {
          const labelList = this.$refs.envRef.labelList
          this.form.fc.setFieldsValue({
            [`envNames[0][${labelList[idx].key}]`]: v.key,
            [`envValues[0][${labelList[idx].key}]`]: v.value,
          })
        })
      })
    }, 500)
  },
  methods: {
    filterOption (input, option) {
      const label = option.componentOptions?.propsData?.label || ''
      return label.toLowerCase().indexOf((input || '').toLowerCase()) >= 0
    },
    async fetchContainerImages () {
      try {
        this.containerImageLoading = true
        const manager = new this.$Manager('container_images', 'v1')
        const result = await manager.list({
          params: {
            details: true,
            limit: 100,
            scope: this.$store.getters.scope,
          },
        })
        const dataArr = result.data.data || []
        this.containerImages = dataArr.map(item => ({
          label: item.name || `${item.image_name}:${item.image_label}`,
          value: item.id,
          ref: `${item.image_name}:${item.image_label}`,
        }))
      } catch (error) {
        throw error
      } finally {
        this.containerImageLoading = false
      }
    },
    handleSourceChange (e) {
      this.source = e.target.value
      this.form.fc.setFieldsValue({
        image: undefined,
        registryImage: undefined,
        imageCredentialId: undefined,
        containerImageId: undefined,
      })
    },
    handleCredentialChange (credentialId) {
      this.form.fc.setFieldsValue({
        imageCredentialId: credentialId,
      })
    },
    async doSubmit (values) {
      const { id, spec } = this.params.data[0]
      const getEnvs = (names, values) => {
        const envs = []
        if (names) {
          for (const k in names) {
            envs.push({ key: names[k], value: values[k] })
          }
        }
        return envs
      }
      let specData = {
        ...spec,
      }
      if (this.editMode === 'custom') {
        const { image, registryImage, imageCredentialId, containerImageId, command, arg, envNames, envValues, privileged, capAdd, capDrop } = values
        if (this.source === 'container_image' && containerImageId) {
          specData.container_image_id = containerImageId
          delete specData.image
          delete specData.image_credential_id
        } else if (this.source === 'registry' && registryImage) {
          specData.image = registryImage
          delete specData.container_image_id
          if (imageCredentialId) {
            specData.image_credential_id = imageCredentialId
          } else {
            delete specData.image_credential_id
          }
        } else if (image) {
          specData.image = image
          delete specData.container_image_id
          delete specData.image_credential_id
        }
        if (command) {
          specData.command = command.split(' ')
        }
        if (arg) {
          specData.args = arg.split(' ')
        }
        if (envNames) {
          specData.envs = getEnvs(envNames[0], envValues[0])
        } else {
          specData.envs = []
        }
        specData.privileged = privileged
        if (capAdd?.length || capDrop?.length) {
          specData.capabilities = {
            add: capAdd || [],
            drop: capDrop || [],
          }
        } else {
          specData.capabilities = undefined
        }
      } else {
        const data = jsYaml.safeLoad(values.yaml)
        specData = data.spec || {}
      }
      return this.params.onManager('update', {
        id,
        managerArgs: {
          data: {
            spec: specData,
          },
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.doSubmit(values)
        this.loading = false
        this.$message.success(this.$t('common.success'))
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        this.$message.error(this.$t('common.failed'))
        throw error
      }
    },
  },
}
</script>

<style lang="less">
.yaml-config-wrapper {
  .CodeMirror {
    height: calc(100vh - 530px);
    min-height: 500px;
    max-height: 80vh;
  }
}
</style>
