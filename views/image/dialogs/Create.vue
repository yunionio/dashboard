<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_18')}}</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <!-- <a-form-item :label="$t('compute.text_228')" v-bind="formItemLayout" v-if="params.title === 'onpremise'">
          <a-input v-decorator="decorators.name" :placeholder="$t('compute.text_228')" @change="handleChange" />
        </a-form-item>
        <a-form-item label="IP" v-bind="formItemLayout" v-if="params.title === 'onpremise'">
          <a-input v-decorator="decorators.access_ip" placeholder="IP" @change="handleChange" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_591')" v-bind="formItemLayout" v-if="params.title === 'onpremise'">
          <a-input v-decorator="decorators.sn" :placeholder="$t('compute.text_591')" @change="handleChange" />
        </a-form-item> -->
        <a-form-item :label="$t('compute.text_176')" v-bind="formItemLayout" v-if="params.title !== 'onpremise'">
          <a-select v-decorator="decorators.platform" @change="handlePlatformChange" :placeholder="$t('compute.text_219')">
            <a-select-option
              v-for="(item, index) in platformOptions"
              :key="index"
              :value="item.name">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('compute.text_653')" v-bind="formItemLayout" v-if="params.title !== 'onpremise'">
          <base-select
            :remote="true"
            class="w-100"
            :needParams="true"
            v-decorator="decorators.manager"
            resource="cloudproviders"
            :params="providerParams"
            :remote-fn="q => ({ filter: `name.contains(${q})` })"
            @change="handleManagerChange"
            :select-props="{ placeholder: $t('compute.text_219') }" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_177')" v-bind="formItemLayout" v-if="params.title !== 'onpremise'">
          <base-select
            :remote="true"
            class="w-100"
            :needParams="true"
            v-decorator="decorators.region"
            resource="cloudregions"
            :params="regionParams"
            :remote-fn="q => ({ search: q })"
            @change="handleRegionChange"
            :select-props="{ placeholder: $t('compute.text_219') }" />
        </a-form-item>
      </a-form>
      <page-list
        :list="list"
        :show-checkbox="true"
        :pagerLayout="['PrevPage', 'Jump', 'PageCount', 'NextPage', 'Total']"
        :columns="cacheColumns" />
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

export default {
  name: 'ImageCreateCache',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        name: [
          'name',
        ],
        access_ip: [
          'access_ip',
        ],
        sn: [
          'sn',
        ],
        platform: [
          'platform',
        ],
        manager: [
          'manager',
        ],
        region: [
          'region',
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
      platformOptions: [],
      regionParams: {},
      providerParams: {},
      filters: ['host_type.notequals(baremetal)'],
      list: this.$list.createList(this, {
        resource: 'hosts',
        limit: 5,
        getParams: this.params.title === 'onpremise' ? {
          show_emulated: true,
          cloud_env: this.params.title,
          'filter.0': 'host_type.notequals(baremetal)',
          usable: true,
        } : {
          show_emulated: true,
          cloud_env: this.params.title,
          usable: true,
        },
        filterOptions: this.params.title === 'onpremise' ? {
          // name: {
          //   label: '名称',
          //   filter: true,
          //   formatter: val => {
          //     return `name.contains(${val})`
          //   },
          // },
          access_ip: {
            label: 'IP',
            filter: true,
            formatter: val => {
              return `access_ip.contains("${val}")`
            },
          },
          sn: {
            label: 'SN',
            distinctField: {
              type: 'extra_field',
              key: 'sn',
            },
          },
        } : undefined,
      }),
      timeout: null,
    }
  },
  computed: {
    cacheColumns () {
      if (this.params.title === 'onpremise') {
        return [
          {
            field: 'brand',
            title: this.$t('compute.text_176'),
          },
          {
            field: 'region',
            title: this.$t('compute.text_177'),
          },
          {
            field: 'zone',
            title: this.$t('compute.text_270'),
          },
          {
            field: 'access_ip',
            title: 'IP',
          },
          {
            field: 'name',
            title: this.$t('compute.text_654'),
          },
          {
            field: 'sn',
            title: 'SN',
            formatter: ({ cellValue }) => {
              if (!cellValue) {
                return '-'
              }
              return cellValue
            },
          },
        ]
      } else {
        return [
          {
            field: 'brand',
            title: this.$t('compute.text_176'),
          },
          {
            field: 'account',
            title: this.$t('compute.text_269'),
          },
          {
            field: 'manager',
            title: this.$t('compute.text_653'),
          },
          {
            field: 'region',
            title: this.$t('compute.text_177'),
          },
          {
            field: 'zone',
            title: this.$t('compute.text_270'),
          },
        ]
      }
    },
    listOptions () {
      return {}
    },
  },
  created () {
    this.fetchPlatform()
    this.list.fetchData()
  },
  methods: {
    // handleChange (e) {
    //   if (e.target.value) {
    //     this.filters.push([e.target.id] + `.contains(${e.target.value})`)
    //     this.list.getParams = {
    //       ...this.list.getParams,
    //       // [e.target.id]: e.target.value,
    //       // 'filter.1': [e.target.id] + `.contains(${e.target.value})`,
    //     }
    //   } else {
    //     if (Reflect.has(this.list.getParams, e.target.id)) {
    //       Reflect.deleteProperty(this.list.getParams, e.target.id)
    //     }
    //   }
    //   clearTimeout(this.timeout)
    //   this.timeout = setTimeout(() => {
    //     this.list.fetchData()
    //   }, 4000)
    // },
    fetchPlatform () {
      return new this.$Manager('rpc/cloudregions/region-providers').list({ params: { usable: true, cloud_env: this.params.title } }).then(({ data }) => {
        this.platformOptions = data
      })
    },
    handlePlatformChange (e) {
      if (this.params.title !== 'onpremise') {
        this.regionParams = {
          usable: true,
          cloud_env: this.params.title,
          show_emulated: true,
          provider: e,
        }
        this.providerParams = {
          usable: true,
          provider: e,
        }
      }
      this.list.getParams = {
        ...this.list.getParams,
        provider: e,
      }
      this.list.fetchData()
    },
    handleRegionChange (e) {
      this.list.getParams = {
        ...this.list.getParams,
        region: e,
      }
      this.list.fetchData()
    },
    handleManagerChange (e) {
      this.list.getParams = {
        ...this.list.getParams,
        manager: e,
      }
      this.list.fetchData()
    },
    doSave () {
      return this.list.onManager('batchPerformAction', {
        id: this.list.selectedItems.map(item => { return item.id }),
        managerArgs: {
          action: 'cache-image',
          data: {
            image: this.params.imageId,
          },
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        if (this.list.selectedItems.length === 0) {
          this.$message.info(this.$t('compute.text_213'))
          this.loading = false
          return
        }
        await this.doSave()
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
