<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.image_cache.perform_batch_precache')}}</div>
    <div slot="body">
      <a-form :form="form.fc">
        <a-form-item :label="$t('compute.text_111')" v-bind="formItemLayout">
          <a-select v-decorator="decorators.hypervisor" @change="handleHypervisorChange" :placeholder="$t('compute.text_219')" :allow-clear="true">
            <a-select-option v-for="item in hostOptions" :key="item.key" :value="item.value">
              {{ item.value }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('compute.host_tag')" class="mb-0" v-bind="formItemLayout">
          <tag
            v-decorator="decorators.host_tags" :params="{ resources: 'host', with_cloud_meta: false }" extra="" multiple />
        </a-form-item>
        <a-form-item :label="$t('compute.text_99')" v-bind="formItemLayout">
          <a-select v-decorator="decorators.storage" :placeholder="$t('compute.text_219')" :allow-clear="true">
            <a-select-option v-for="item in storageOptions" :key="item.key" :value="item.value">
              {{ item.value }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('compute.storage_tag')" class="mb-0" v-bind="formItemLayout">
          <tag
            v-decorator="decorators.storage_tags" :params="{ resources: 'storage', with_cloud_meta: false }" multiple extra="" />
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
import validateForm from '@/utils/validate'
import Tag from '@/sections/Tag'

export default {
  name: 'ImageBatchCreateCache',
  components: {
    Tag,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
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
      decorators: {
        hypervisor: [
          'hypervisor',
        ],
        storage: [
          'storage',
        ],
        host_tags: [
          'host_tags',
          {
            rules: [
              { validator: validateForm('tagName') },
            ],
          },
        ],
        storage_tags: [
          'storage_tags',
          {
            rules: [
              { validator: validateForm('tagName') },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      hypervisors: [],
      hypervisor: null,
      storageTypes: {},
    }
  },
  computed: {
    hostOptions () {
      const ret = []
      for (let i = 0; i < this.hypervisors.length; i++) {
        ret.push({
          key: this.hypervisors[i],
          value: this.hypervisors[i],
        })
      }
      return ret
    },
    storageOptions () {
      const ret = []
      if (!this.hypervisor || !this.storageTypes[this.hypervisor]) {
        return ret
      }
      for (let i = 0; i < this.storageTypes[this.hypervisor].length; i++) {
        ret.push({
          key: this.storageTypes[this.hypervisor][i],
          value: this.storageTypes[this.hypervisor][i],
        })
      }
      return ret
    },
  },
  created () {
    this.fetchPlatform()
  },
  methods: {
    async fetchPlatform () {
      const res = await new this.$Manager('capabilities').list({
        params: {
          scope: this.$store.getters.scope,
        },
      })
      this.hypervisors = res.data.data[0].hypervisors
      if (this.hypervisors.length > 0) {
        this.hypervisor = this.hypervisors[0]
      }
      this.storageTypes = res.data.data[0].storage_types2
    },
    handleHypervisorChange (v) {
      this.hypervisor = v
      this.$nextTick(() => {
        this.form.fc.setFieldsValue({ storage: null })
      })
    },
    formatTags (tags) {
      const filters = [{}]
      Object.keys(tags).forEach(key => {
        let value = tags[key]
        if (R.is(String, value) && value) {
          value = [value]
        } else if (R.is(String, value) && !value) {
          value = []
        } else {
          value = value.map(item => item)
        }
        filters[0][key] = value
      })
      return { filters }
    },
    async handleConfirm () {
      this.loading = true
      try {
        const data = {
          image_id: this.params.imageId,
          auto_cache: true,
        }
        const { hypervisor, storage, host_tags, storage_tags } = await this.form.fc.validateFields()
        if (hypervisor) {
          const hostType = []
          if (hypervisor === 'kvm') {
            hostType.push('hypervisor')
          } else if (hypervisor === 'pod') {
            hostType.push('container')
          }
          data.host_type = hostType
        }
        if (storage) {
          const storageType = []
          const parts = storage.split('/')
          if (parts && parts.length > 0) {
            storageType.push(parts[0])
          }
          data.storage_type = storageType
        }
        if (host_tags && Object.keys(host_tags).length > 0) {
          data.host_tags = this.formatTags(host_tags)
        }
        if (storage_tags && Object.keys(storage_tags).length > 0) {
          data.storage_tags = this.formatTags(storage_tags)
        }
        const manager = new this.$Manager('cachedimages')
        manager.performClassAction({
          action: 'cache-image',
          data: data,
        })
        this.loading = false
        this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
