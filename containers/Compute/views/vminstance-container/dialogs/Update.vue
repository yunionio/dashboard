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
              @change="handleContainerImageChange"
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
            <a-input v-decorator="decorators.command" :disabled="imageHasCommand" :placeholder="$t('compute.repo.command.placeholder')" />
            <div v-if="imageHasCommand" class="ant-form-explain">{{ $t('compute.repo.image.container_image.locked_tip') }}</div>
          </a-form-item>
          <a-form-item :label="$t('compute.repo.command.params')">
            <a-input v-decorator="decorators.arg" :disabled="imageHasArgs" :placeholder="$t('compute.repo.command.params.placeholder')" />
            <div v-if="imageHasArgs" class="ant-form-explain">{{ $t('compute.repo.image.container_image.locked_tip') }}</div>
          </a-form-item>
          <a-form-item :label="$t('compute.repo.env_variables')">
            <labels ref="envRef" :decorators="decorators.env(0)" :title="$t('compute.repo.variables')" :keyLabel="$t('compute.repo.variables')" :readonly-keys="lockedEnvKeys" />
            <div v-if="lockedEnvKeys.length" class="ant-form-explain">{{ $t('compute.repo.image.container_image.env_locked_tip') }}</div>
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
      // 当前选中的容器镜像（含 command/args/envs）
      selectedImage: null,
      // 由容器镜像提供的环境变量 key，这些行不可修改、不可删除
      lockedEnvKeys: [],
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
    imageHasCommand () {
      return !!(this.selectedImage && (this.selectedImage.command || []).filter(Boolean).length)
    },
    imageHasArgs () {
      return !!(this.selectedImage && (this.selectedImage.args || []).filter(Boolean).length)
    },
  },
  watch: {
    source (val) {
      if (val === 'container_image' && this.containerImages.length === 0 && !this.containerImageLoading) {
        this.fetchContainerImages()
      }
    },
  },
  mounted () {
    if (this.source === 'container_image') {
      this.fetchContainerImages().then(() => {
        this.syncSelectedImage()
      }).catch(() => {})
    }
    setTimeout(() => {
      const envs = this.selectItems[0].spec?.envs || []

      if (this.$refs.envRef) {
        this.$refs.envRef.initData(envs.map(v => ({ key: v.key, value: v.value })))
      }
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
          command: item.command || [],
          args: item.args || [],
          envs: item.envs || [],
        }))
      } catch (error) {
        throw error
      } finally {
        this.containerImageLoading = false
      }
    },
    findContainerImage (imageId) {
      return this.containerImages.find(img => img.value === imageId) || null
    },
    /** 回显时仅同步锁定状态，不改写已保存的 command/args/envs */
    syncSelectedImage () {
      const imageId = this.form.fc.getFieldValue('containerImageId')
      const image = this.findContainerImage(imageId || this.params.data[0].spec?.container_image_id)
      if (!image) return
      this.selectedImage = image
      this.lockedEnvKeys = (image.envs || []).map(env => env.key).filter(Boolean)
    },
    envDecorators () {
      const env = this.decorators && this.decorators.env
      if (!env) return null
      return typeof env === 'function' ? env(0) : env
    },
    /** 读取当前表单里已填写的环境变量行 */
    readEnvRows () {
      const envRef = this.$refs.envRef
      const fc = this.form && this.form.fc
      const d = this.envDecorators
      if (!envRef || !fc || !d) return []
      const rows = []
      ;(envRef.labelList || []).forEach((row) => {
        const keyField = d.key(row.key) && d.key(row.key)[0]
        const valueField = d.value(row.key) && d.value(row.key)[0]
        const key = keyField ? fc.getFieldValue(keyField) : undefined
        if (key == null || key === '') return
        rows.push({ key, value: valueField ? fc.getFieldValue(valueField) : undefined })
      })
      return rows
    },
    /** 镜像环境变量中可在表单里展示的行（value_from 类型的值无法用表单表达，交由后端合并） */
    imageEnvRows (image) {
      return ((image && image.envs) || [])
        .filter(env => env.key && !env.value_from)
        .map(env => ({ key: env.key, value: env.value }))
    },
    /** 合并环境变量：以已有行为基础，镜像同名 key 覆盖其值，新 key 追加（与后端语义一致） */
    mergeImageEnvs (baseRows, imageEnvs) {
      const out = []
      const indexByKey = {}
      ;(baseRows || []).forEach((row) => {
        const key = (row.key || '').trim()
        if (!key) return
        indexByKey[key] = out.length
        out.push({ key, value: row.value })
      })
      ;(imageEnvs || []).forEach((env) => {
        const key = (env.key || '').trim()
        if (!key) return
        if (indexByKey[key] !== undefined) {
          out[indexByKey[key]] = { key: out[indexByKey[key]].key, value: env.value }
          return
        }
        indexByKey[key] = out.length
        out.push({ key, value: env.value })
      })
      return out
    },
    /**
     * 应用容器镜像的默认启动参数与环境变量
     * @param {Object} image 容器镜像对象
     * @param {Object} options refillCommand: 是否回填 command/args；keepExistingEnvs: 是否保留并合并已有 env 行
     */
    applyImageDefaults (image, options = {}) {
      const { refillCommand = true, keepExistingEnvs = true } = options
      this.selectedImage = image || null
      const envs = (image && image.envs) || []
      this.lockedEnvKeys = envs.map(env => env.key).filter(Boolean)
      const fc = this.form && this.form.fc
      if (image && refillCommand && fc) {
        const values = {}
        const command = (image.command || []).filter(Boolean)
        const args = (image.args || []).filter(Boolean)
        if (command.length) values.command = command.join(' ')
        if (args.length) values.arg = args.join(' ')
        if (Object.keys(values).length) fc.setFieldsValue(values)
      }
      const envRef = this.$refs.envRef
      if (!envRef) return
      const base = keepExistingEnvs ? this.readEnvRows() : []
      const rows = this.mergeImageEnvs(base, this.imageEnvRows(image))
      envRef.reset()
      if (rows.length) {
        this.$nextTick(() => {
          envRef.initData(rows)
        })
      }
    },
    handleContainerImageChange (value) {
      this.applyImageDefaults(this.findContainerImage(value))
    },
    handleSourceChange (e) {
      this.source = e.target.value
      // 离开容器镜像来源时，清空锁定状态
      this.selectedImage = null
      this.lockedEnvKeys = []
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
