<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">新建</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item label="平台" v-bind="formItemLayout">
          <a-select v-decorator="decorators.platform" @change="handlePlatformChange">
            <a-select-option
              v-for="(item, index) in platformOptions"
              :key="index"
              :value="item.name">
              {{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="区域" v-bind="formItemLayout" v-if="params.title !== 'onpremise'">
          <base-select
            :remote="true"
            class="w-100"
            :needParams="true"
            v-decorator="decorators.region"
            resource="cloudregions"
            :params="regionParams"
            :remote-fn="q => ({ search: q })"
            @change="handleRegionChange"
            :select-props="{ placeholder: '请选择' }" />
        </a-form-item>
        <a-form-item label="云订阅" v-bind="formItemLayout" v-if="params.title !== 'onpremise'">
          <base-select
            :remote="true"
            class="w-100"
            :needParams="true"
            v-decorator="decorators.manager"
            resource="cloudproviders"
            :params="providerParams"
            :remote-fn="q => ({ filter: `name.contains(${q})` })"
            @change="handleManagerChange"
            :select-props="{ placeholder: '请选择' }" />
        </a-form-item>
      </a-form>
      <page-list
        :list="list"
        :showSelection="true"
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
      }),
    }
  },
  computed: {
    cacheColumns () {
      if (this.params.title === 'onpremise') {
        return [
          {
            field: 'name',
            title: '名称',
          },
          {
            field: 'access_ip',
            title: 'IP',
          },
          {
            field: 'zone',
            title: '可用区',
          },
          {
            field: 'region',
            title: '区域',
          },
          {
            field: 'brand',
            title: '平台',
          },
        ]
      } else {
        return [
          {
            field: 'zone',
            title: '可用区',
          },
          {
            field: 'region',
            title: '区域',
          },
          {
            field: 'brand',
            title: '平台',
          },
          {
            field: 'account',
            title: '云账号',
          },
          {
            field: 'manager',
            title: '云订阅',
          },
        ]
      }
    },
  },
  created () {
    this.fetchPlatform()
    this.list.fetchData()
  },
  methods: {
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
      return this.list.onManager('performAction', {
        id: this.list.selectedItems[0].id,
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
        await this.doSave()
        this.loading = false
        this.cancelDialog()
        this.params.list.refresh()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
