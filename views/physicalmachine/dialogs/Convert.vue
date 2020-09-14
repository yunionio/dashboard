<template>
  <base-dialog @cancel="cancelDialog" :width="900">
    <div slot="header">{{$t('compute.text_828')}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.physicalmachine')" :count="params.data.length" :action="$t('compute.text_828')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 2)" />
       <a-form
        :form="form.fc">
        <a-form-item :label="$t('compute.text_829')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" :placeholder="$t('compute.text_830')" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_831')" v-bind="formItemLayout">
          <a-select v-decorator="decorators.host_type" :placeholder="$t('compute.text_831')">
            <a-select-option v-for="item in hostTypeOptions" :key="item.value" :value="item.value">
              {{item.text}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('compute.text_832')" v-bind="formItemLayout">
          <a-select v-decorator="decorators.raid" :placeholder="$t('compute.text_832')" @change="raidChange">
            <a-select-option v-for="item in raidOptions" :key="item.value" :value="item.value">
              {{item.text}}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item :label="$t('compute.text_96')" v-bind="formItemLayout" v-if="isShowImages">
         <base-select
            :filterable="true"
            v-decorator="decorators.image"
            needParams
            resource="images"
            version="v1"
            :params="imagesParams"
            :mapper="imagesResourceMapper"
            :resList.sync="imagesData"
            @update:item="imagechange"
            :select-props="{ placeholder: $t('compute.text_833') }" />
        </a-form-item>
        <a-form-item v-bind="formItemLayout" :label="$t('compute.text_834')" v-if="isShowImages">
          <div class="d-flex flex-wrap">
            <template v-for="(item, idx) of diskOptionsDate">
              <div :key="idx" class="disk-option-item">
                <a-card hoverable>
                  <template slot="title">
                    <icon type="res-disk" />
                    {{ item.title }}
                    <a-tooltip :title="$t('compute.text_304')">
                      <a-icon type="check-circle" theme="twoTone" twoToneColor="#52c41a" v-show="(idx === 0 && !isShowFalseIcon) || idx !== 0" />
                    </a-tooltip>
                    <a-tooltip :title="$t('compute.text_305')">
                      <a-icon type="close-circle" theme="twoTone" twoToneColor="#eb2f96" v-show="idx === 0 && isShowFalseIcon" />
                    </a-tooltip>
                  </template>
                  <a href="javascript:;" slot="extra" @click="handleDiskItemRemove(idx)" v-show="idx === diskOptionsDate.length - 1">{{$t('compute.text_261')}}</a>
                  <div class="d-flex align-items-center">
                    <ve-pie :data="item.chartData" :settings="chartSettings" :events="chartFun(idx)" width="200px" height="200px" :legend-visible="false" />
                    <div class="flex-fill ml-2">
                      <template v-for="k in item.diskInfo">
                        <div :key="k">
                          <a-checkbox defaultChecked disabled>
                            {{k}}
                          </a-checkbox>
                        </div>
                      </template>
                      <a-tag color="blue">{{$t('compute.text_306', [item.size])}}</a-tag>
                    </div>
                  </div>
                </a-card>
              </div>
            </template>
          </div>
        </a-form-item>
        <a-form-item :wrapper-col="{ span: 18, offset: 4 }" v-if="isShowImages">
          <a-button type="primary" @click="addDisk">{{$t('compute.text_307')}}</a-button>
        </a-form-item>
        <a-form-item :label="$t('compute.text_104')" v-bind="formItemLayout" class="mb-0" v-if="isShowNetwork">
          <server-network
            :form="form"
            :decorator="decorators.network"
            :isBonding="isBonding"
            :network-resource-mapper="networkResourceMapper"
            :network-list-params="networkParams"
            :schedtag-params="resourcesParams.schedtag"
            :networkVpcParams="resourcesParams.vpcParams"
            :vpcResource="vpcResource"
            :vpcResourceMapper="vpcResourceMapper" />
        </a-form-item>
        <a-form-item :wrapper-col="{ span: 18, offset: 4 }" v-if="isShowNetwork">
          <a-checkbox v-model="isBonding">{{$t('compute.text_310')}}</a-checkbox>
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
import * as R from 'ramda'
import { NETWORK_OPTIONS_MAP } from '@Compute/constants'
import ServerNetwork from '@Compute/sections/ServerNetwork'
import { sizestr } from '@/utils/utils'
import { isWithinRange } from '@/utils/validate'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import i18n from '@/locales'

function checkIpInSegment (i, networkData) {
  return (rule, value, cb) => {
    const isIn = isWithinRange(value, networkData.guest_ip_start, networkData.guest_ip_end)
    if (isIn) {
      cb()
    } else {
      cb(new Error(this.$t('compute.text_205')))
    }
  }
}

export default {
  name: 'HostsConvertDialog',
  components: {
    ServerNetwork,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      scope: this.$store.getters.scope,
      form: {
        fc: this.$form.createForm(this),
        fi: {
          capability: {},
        },
      },
      decorators: {
        name: [
          'name',
          {
            initialValue: this.params.data[0].name,
            validateFirst: true,
            rules: [
              {
                required: true, message: this.$t('compute.text_835'),
              },
              {
                validator: this.$validate('serverCreateName'),
              },
            ],
          },
        ],
        host_type: [
          'host_type',
          {
            initialValue: 'hypervisor',
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
        network: {
          networkType: [
            'networkType',
            {
              initialValue: NETWORK_OPTIONS_MAP.default.key,
            },
          ],
          networkConfig: {
            vpcs: i => [
              `vpcs[${i}]`,
              {
                validateTrigger: ['change', 'blur'],
                rules: [{
                  required: true,
                  message: this.$t('compute.text_194'),
                }],
              },
            ],
            networks: i => [
              `networks[${i}]`,
              {
                validateTrigger: ['change', 'blur'],
                rules: [{
                  required: true,
                  message: this.$t('compute.text_217'),
                }],
              },
            ],
            ips: (i, networkData) => [
              `networkIps[${i}]`,
              {
                validateFirst: true,
                validateTrigger: ['blur', 'change'],
                rules: [{
                  required: true,
                  message: this.$t('compute.text_218'),
                }, {
                  validator: checkIpInSegment(i, networkData),
                }],
              },
            ],
          },
          networkSchedtag: {
            schedtags: i => [
              `networkSchedtags[${i}]`,
              {
                validateTrigger: ['change', 'blur'],
                rules: [{
                  required: true,
                  message: this.$t('compute.text_123'),
                }],
              },
            ],
            policys: (i, networkData) => [
              `networkPolicys[${i}]`,
              {
                validateTrigger: ['blur', 'change'],
                rules: [{
                  required: true,
                  message: this.$t('compute.text_123'),
                }],
              },
            ],
          },
        },
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
        { text: this.$t('compute.text_836'), value: 'hypervisor' },
      ],
      imagesParams: {},
      isShowImages: false,
      isShowNetwork: false,
      imagesData: [],
      diskOptionsDate: [], // 自定义磁盘配置数据
      chartSettings: { // echart配置信息
        limitShowNum: 5,
        radius: 50,
        selectedMode: 'single',
        labelLine: {
          normal: {
            show: true,
          },
        },
        label: {
          position: 'inside',
        },
        itemStyle: {
          color: function (params) {
            const colorList = ['#afa3f5', '#00d488', '#3feed4', '#3bafff', '#f1bb4c', 'rgba(250,250,250,0.5)']
            if (params.data.name === i18n.t('compute.text_315')) {
              return '#e3e3e3'
            } else {
              return colorList[params.dataIndex]
            }
          },
        },
        offsetY: 100,
        dataType: function (v) {
          return v + ' G'
        },
      },
      diskData: this.params.data[0].spec.disk, // 规格中的硬盘数据
      selectedImage: {}, // 选中的镜像
      isBonding: false,
      resourcesParams: {
        schedtag: {
          limit: 1024,
          'filter.0': 'resource_type.equals(networks)',
        },
        vpcParams: {
          usable: true,
          scope: this.$store.getters.scope,
          // limit: 0,
          // show_emulated: true,
          filter: 'id.equals("default")',
        },
      },
      isShowFalseIcon: false,
      count: 1,
    }
  },
  provide () {
    return {
      form: this.form,
      fi: this.form.fi,
    }
  },
  computed: {
    networkParams () {
      const ret = {
        scope: this.$store.getters.scope,
        zone: this.params.data[0].zone_id,
        host: this.params.data[0].id,
        usable: true,
      }
      if (this.wireIds) ret.filter = `wire_id.in(${this.wireIds})`
      return ret
    },
    wireIds () {
      if (this.params.data[0].nic_info) {
        const arr = this.params.data[0].nic_info.filter(item => {
          return item.nic_type !== 'ipmi' && item.wire_id
        })
        let str = ''
        arr.map(item => {
          str += `${item.wire_id},`
        })
        str = str.substr(0, str.length - 1)
        return str
      }
      return null
    },
    raidOptions () {
      let flag = false
      const items = this.params.data[0]
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
          { text: this.$t('compute.text_837'), value: 'custom' },
        ]
      }
      return [
        { text: this.$t('compute.text_838'), value: '' },
        { text: this.$t('compute.text_839'), value: 'raid10' },
        { text: this.$t('compute.text_840'), value: 'raid5' },
        { text: this.$t('compute.text_841'), value: 'raid0' },
        { text: this.$t('compute.text_837'), value: 'custom' },
      ]
    },
    vpcResource () {
      return `cloudregions/${this.params.data[0].cloudregion_id}/vpcs`
    },
  },
  watch: {
    imagesData: {
      handler (val) {
        this.form.fc.setFieldsValue({ image: val[0].id })
        this.selectedImage = val[0]
      },
    },
    isShowImages: {
      handler (val) {
        if (val) {
          this.capability()
        }
      },
    },
    diskOptionsDate: {
      handler (val) {
        let isDistribution = false
        let isDiff = false // 是否存在不通的raid盘
        for (var i = 0; i < this.diskOptionsDate.length; i++) {
          // 每一项是否有分配磁盘
          if (i > 0) {
            const rowsLength = this.diskOptionsDate[i].chartData.rows.length
            if ((rowsLength === 1 && this.diskOptionsDate[i].chartData.rows[0].name !== this.$t('compute.text_315')) || (rowsLength > 1)) {
              isDistribution = true
            }
          }
          if (this.diskOptionsDate[0].diskInfo[1] !== this.diskOptionsDate[i].diskInfo[1]) {
            isDiff = true
          }
          if (isDiff && this.diskOptionsDate[0].remainder > 0 && isDistribution) {
            this.isShowFalseIcon = true
          } else {
            this.isShowFalseIcon = false
          }
        }
      },
      deep: true,
    },
  },
  created () {
    this.zonesM2 = new this.$Manager('zones')
  },
  methods: {
    vpcResourceMapper (list) {
      return list.filter(val => val.id === 'default')
    },
    // 过滤network数据
    networkResourceMapper (data) {
      data = data.filter((d) => d.server_type !== 'ipmi' && d.server_type !== 'pxe')
      return data
    },
    capability () { // 可用区查询
      const data = { show_emulated: true, resource_type: 'shared', scope: this.$store.getters.scope, host_type: 'baremetal' }
      this.zonesM2.get({
        id: `${this.params.data[0].zone_id}/capability`,
        params: data,
      }).then(({ data = {} }) => {
        this.form.fi.capability = {
          ...data,
        }
      })
    },
    raidChange (e) {
      if (e === 'custom') {
        this.isShowImages = true
        this.imagesParams = {
          is_standard: 'false',
          status: 'active',
          details: true,
          'filter.0': 'disk_format.notequals(iso)',
        }
      } else {
        this.isShowImages = false
      }
      if (e === 'custom' || e === '' || e === 'raid10' || e === 'raid5' || e === 'raid0') {
        this.isShowNetwork = true
      }
    },
    // 镜像改变
    imagechange (e) {
      this.imagesData.forEach(item => {
        if (item.id === e.id) {
          this.selectedImage = item
        }
      })
    },
    imagesResourceMapper (data) {
      data = data.filter((d) => d.properties?.os_type === 'Linux')
      return data
    },
    // 添加硬盘配置
    addDisk () {
      this.createDialog('BaremetalCreateDiskDialog', {
        title: this.$t('compute.text_18'),
        diskData: this.diskData,
        diskOptionsDate: this.diskOptionsDate,
        updateData: (data) => {
          this.addDiskCallBack(data)
        },
      })
    },
    // 添加硬盘配置后的回调
    addDiskCallBack (data) {
      let arr = []
      data.option.forEach(item => {
        arr = arr.concat(item.split(':'))
      })
      let range = []
      if (data.option[2] === 'none') {
        range = [data.start_index]
      } else {
        let k = data.start_index
        while (k < data.start_index + data.count) {
          range.push(k)
          k++
        }
      }
      const isRepeat = this.diskOptionsDate.filter(item => item.diskInfo[1] === arr[1] && item.type === arr[2] && item.size === arr[3])
      if (isRepeat.length > 0) {
        if (data.option[2] === 'none') {
          range = [data.start_index + this.count + 1]
        } else {
          if (data.start_index === 0) {
            const lastIndexRange = isRepeat[isRepeat.length - 1].range
            let i = lastIndexRange[lastIndexRange.length - 1]
            let p = 0
            range = []
            while (p < data.count) {
              i++
              range.push(i)
              p++
            }
          } else {
            let j = data.start_index
            range = []
            while (j < data.start_index + data.count) {
              range.push(j)
              j++
            }
          }
        }
      }
      let sizeNumber = 0
      let n = 0
      if (arr[3].substr(arr[3].length - 1, 1) === 'T') {
        n = Number(arr[3].substr(0, arr[3].length - 1)) * 1024
      } else {
        n = Number(arr[3].substr(0, arr[3].length - 1))
      }
      if (arr[4] === 'none') {
        sizeNumber = n
      } else {
        sizeNumber = this.raidUtil(n, arr[4], data.count)
      }
      const option = {
        title: arr[3] + ' ' + arr[2] + ' X ' + `${data.option[2] === 'none' ? 1 : data.count}`,
        size: sizestr(sizeNumber, 'G', 1024),
        unitSize: sizestr(n, 'G', 1024),
        chartData: {
          columns: ['name', 'size'],
          rows: [],
        },
        diskInfo: [arr[0], arr[1], arr[4]],
        count: data.option[2] === 'none' ? 1 : data.count,
        type: arr[2],
        range,
      }
      if (this.diskOptionsDate.length === 0) {
        const defaultSize = 30
        const imageDiskSize = this.selectedImage.min_disk / 1024
        if (imageDiskSize >= defaultSize) {
          sizeNumber = sizeNumber - imageDiskSize
          option.chartData.rows.push({ name: this.$t('compute.text_316'), size: imageDiskSize })
        } else {
          sizeNumber = sizeNumber - defaultSize
          option.chartData.rows.push({ name: '/', size: defaultSize })
        }
      }
      option.remainder = sizeNumber
      option.chartData.rows.push({ name: this.$t('compute.text_315'), size: sizeNumber })
      this.diskOptionsDate.push(option)
      data.computeCount--
      if (data.option[2] === 'none' && data.computeCount > 0) {
        this.addDiskCallBack(data)
      }
    },
    // 删除硬盘配置
    handleDiskItemRemove (idx) {
      this.diskOptionsDate.splice(idx, 1)
    },
    // 绑定echart点击扇形区域触发的回调
    chartFun (idx) {
      return {
        click: (e, index) => this.handleChartEvents(e, idx),
      }
    },
    // echart点击扇形区域触发的回调
    handleChartEvents (e, idx) {
      const selectedArea = this.diskOptionsDate[idx].chartData.rows.filter(item => item.name === e.name)
      let nameArr = []
      this.diskOptionsDate.forEach(item => {
        nameArr = nameArr.concat(item.chartData.rows)
      })
      nameArr = nameArr.filter(item => item.name !== this.$t('compute.text_315'))
      this.createDialog('DiskOptionsUpdateDialog', {
        title: e.name === this.$t('compute.text_315') ? this.$t('compute.text_317') : this.$t('compute.text_318'),
        item: this.diskOptionsDate[idx],
        nameArr,
        selectedArea: selectedArea[0],
        updateData: (values) => {
          const updateItem = this.diskOptionsDate[idx].chartData.rows
          if (e.name === this.$t('compute.text_315')) {
            // 创建新分区
            updateItem.unshift({ name: values.name, size: values.size, format: values.format })
            if (values.size === this.diskOptionsDate[idx].remainder || values.method === 'autoextend') {
              this.diskOptionsDate[idx].remainder = 0
              updateItem.pop()
              return
            }
            this.diskOptionsDate[idx].remainder = this.diskOptionsDate[idx].remainder - values.size
            updateItem[updateItem.length - 1].size = updateItem[updateItem.length - 1].size - values.size
          } else {
            // 更新分区
            let oldSize = 0
            updateItem.forEach(item => {
              if (item.name === e.name) {
                item.name = values.name
                oldSize = item.size
                item.size = values.size
              }
            })
            // 如何剩余比更新的大
            if (this.diskOptionsDate[idx].remainder > values.size) {
              updateItem[updateItem.length - 1].size = updateItem[updateItem.length - 1].size + oldSize - values.size
              this.diskOptionsDate[idx].remainder = this.diskOptionsDate[idx].remainder + oldSize - values.size
              if (updateItem[updateItem.length - 1].name === this.$t('compute.text_315')) {
                updateItem[updateItem.length - 1].size = this.diskOptionsDate[idx].remainder
              } else {
                updateItem.push({ name: this.$t('compute.text_315'), size: this.diskOptionsDate[idx].remainder })
              }
            } else {
              if (values.method === 'autoextend') {
                this.diskOptionsDate[idx].remainder = 0
                updateItem.pop()
                return
              }
              this.diskOptionsDate[idx].remainder = (oldSize - values.size) + this.diskOptionsDate[idx].remainder
              if (this.diskOptionsDate[idx].remainder === 0) return
              if (updateItem[updateItem.length - 1].name === this.$t('compute.text_315')) {
                updateItem[updateItem.length - 1].size = this.diskOptionsDate[idx].remainder
              } else {
                updateItem.push({ name: this.$t('compute.text_315'), size: this.diskOptionsDate[idx].remainder })
              }
            }
          }
        },
      })
    },
    // raid计算大小公式
    raidUtil (n, raid, m) {
      let size = 0
      switch (raid) {
        case 'raid0':
          size = n * m
          break
        case 'raid1':
          size = n * m / m
          break
        case 'raid5':
          size = n * (m - 1)
          break
        case 'raid10':
          size = n * m / 2
          break
      }
      return size
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    doConvert (data) {
      return this.params.onManager('performAction', {
        id: this.params.data[0].id,
        managerArgs: {
          action: 'convert-hypervisor',
          data,
        },
      })
    },
    genParmas (values) {
      const diskConfigs = []
      const disks = []
      const nets = []
      const params = {}
      if (values.networks) {
        const networks = values.networks
        for (const key in networks) {
          const option = {
            network: networks[key],
          }
          if (!R.isNil(values.networkIps) && !R.isEmpty(values.networkIps)) {
            option.address = values.networkIps[key]
          }
          // 是否启用bonding
          if (this.isBonding) {
            option.require_teaming = true
            if (this.isInstallOperationSystem) option.private = false
            nets.push(option)
          } else {
            nets.push(option)
          }
        }
      } else {
        // 是否启用bonding
        if (this.isBonding) {
          nets.push({ exit: false, require_teaming: true })
        } else {
          nets.push({ exit: false })
        }
      }
      if (nets.length > 0) {
        params.nets = nets
      }
      if (this.isShowImages) {
        // 判断数据盘是否合法
        if (this.diskOptionsDate.length > 0) {
          if (this.isShowFalseIcon) {
            this.$message.error(this.$t('compute.text_319'))
            throw new Error(this.$t('compute.text_319'))
          }
          // 将系统盘放置首位
          const systemDisk = this.diskOptionsDate[0].chartData.rows.pop()
          this.diskOptionsDate[0].chartData.rows.unshift(systemDisk)
          for (var i = 0; i < this.diskOptionsDate.length; i++) {
            const rows = this.diskOptionsDate[i].chartData.rows
            const adapter = Number(this.diskOptionsDate[i].diskInfo[1].charAt(this.diskOptionsDate[i].diskInfo[1].length - 1))
            const configOption = {
              conf: this.diskOptionsDate[i].diskInfo[2],
              driver: this.diskOptionsDate[i].diskInfo[0],
              count: this.diskOptionsDate[i].count,
              range: this.diskOptionsDate[i].range,
              adapter,
              type: this.diskOptionsDate[i].type === 'HDD' ? 'rotate' : 'SSD',
            }
            diskConfigs.push(configOption)
            for (var j = 0; j < rows.length; j++) {
              let option = {
                size: rows[j].size * 1024,
                fs: rows[j].format,
                mountpoint: rows[j].name,
              }
              if (i === 0 && j === 0) {
                option = {
                  size: rows[j].size * 1024,
                  image_id: this.selectedImage.id,
                }
              }
              if (j === rows.length - 1) {
                option.size = -1
                if (!rows[j].format) {
                  Reflect.deleteProperty(option, 'fs')
                }
                if (rows[j].name === this.$t('compute.text_315')) {
                  Reflect.deleteProperty(option, 'mountpoint')
                }
              }
              disks.push(option)
            }
          }
          // 根据adapter排序diskConfigs
          diskConfigs.sort((a, b) => { return a.adapter - b.adapter })
          return {
            ...params,
            name: values.name,
            host_type: values.host_type,
            disks,
            baremetal_disk_configs: diskConfigs,
          }
        } else {
          this.$message.error(this.$t('compute.text_842'))
          throw new Error(this.$t('compute.text_842'))
        }
      }
      return {
        ...params,
        name: values.name,
        host_type: values.host_type,
        raid: values.raid,
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        const params = this.genParmas(values)
        await this.doConvert(params)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
