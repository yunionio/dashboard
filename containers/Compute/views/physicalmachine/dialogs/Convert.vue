<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">转换为宿主机</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" action="转换为宿主机" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 2)" />
       <a-form
        :form="form.fc">
        <a-form-item label="宿主机名称" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" placeholder="请填写宿主机名称" />
        </a-form-item>
        <a-form-item label="宿主机类型" v-bind="formItemLayout">
          <a-select v-decorator="decorators.host_type" placeholder="宿主机类型">
            <a-select-option v-for="item in hostTypeOptions" :key="item.value" :value="item.value">
              {{item.text}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="磁盘RAID配置" v-bind="formItemLayout">
          <a-select v-decorator="decorators.raid" placeholder="磁盘RAID配置" @change="raidChange">
            <a-select-option v-for="item in raidOptions" :key="item.value" :value="item.value">
              {{item.text}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="镜像" v-bind="formItemLayout" v-if="isShowImages">
         <base-select
            :filterable="true"
            v-decorator="decorators.image"
            needParams
            resource="images"
            version="v1"
            :params="imagesParams"
            :mapper="imagesResourceMapper"
            :options.sync="imagesData"
            :select-props="{ placeholder: '系统盘镜像' }" />
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
import _ from 'lodash'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'HostsConvertDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      scope: this.$store.getters.scope,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        name: [
          'name',
          {
            initialValue: this.params.data[0].name,
            rules: [
              { required: true },
            ],
          },
        ],
        host_type: [
          'host_type',
          {
            rules: [
              { required: true },
            ],
          },
        ],
        raid: [
          'raid',
        ],
        image: [
          'image',
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
      hostTypeOptions: [
        { text: 'KVM宿主机', value: 'hypervisor' },
      ],
      imagesParams: {},
      isShowImages: false,
      imagesData: [],
    }
  },
  computed: {
    raidOptions () {
      let flag = false
      let items = this.params.data[0]
      if (Object.keys(items.spec.disk).length > 1) {
        flag = true
      } else {
        _.forEach(items.spec.disk, function (adapters, driver) {
          if (Object.keys(adapters).length > 1) {
            flag = true
          } else {
            _.forEach(adapters, function (disks, adapter) {
              if (disks.length > 1) {
                flag = true
              }
            })
          }
        })
      }
      if (flag) {
        return [
          { text: '自定义配置', value: 'custom' },
        ]
      }
      return [
        { text: '默认配置 (最高冗余)', value: '' },
        { text: 'RAID-1/RAID-10 (2倍冗余)', value: 'raid10' },
        { text: 'RAID-5 (1.x倍冗余)', value: 'raid5' },
        { text: 'RAID-0 (无冗余)', value: 'raid0' },
        { text: '自定义配置', value: 'custom' },
      ]
    },
  },
  watch: {
    'imagesData': {
      handler (val) {
        this.form.fc.setFieldsValue({ 'image': val[0].id })
      },
    },
  },
  methods: {
    raidChange (e) {
      if (e === 'custom') {
        this.isShowImages = true
        this.imagesParams = {
          'is_standard': 'false',
          'status': 'active',
          'details': true,
          'filter.0': 'disk_format.notequals(iso)',
        }
      } else {
        this.isShowImages = false
      }
    },
    imagesResourceMapper (data) {
      data = data.filter((d) => d.properties.os_type === 'Linux')
      return data
    },
    doBindSchedTags (data) {
      return this.params.list.onManager('batchPerformAction', {
        id: this.params.data[0].id,
        managerArgs: {
          action: 'set-schedtag',
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        let values = await this.form.fc.validateFields()
        values.schedTags.forEach((item, idx) => {
          values[`schedtag.${idx}`] = item
        })
        Reflect.deleteProperty(values, 'schedTags')
        this.loading = true
        await this.doBindSchedTags(values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
