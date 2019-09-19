<template>
  <div class="diskconfig-dialog">
    <a-modal
      title="新增磁盘配置"
      :visible="visible"
      @cancel="cancel"
      @ok="submit">
      <a-form :form="form">
        <a-form-item label="磁盘配置" :label-col="{ span: 4 }" :wrapper-col="{ span: 19 }">
          <a-cascader v-decorator="decorator.diskconfig" :options="disksOptions" placeholder="请选择配置" />
        </a-form-item>
        <a-form-item label="磁盘数量" :label-col="{ span: 4 }" :wrapper-col="{ span: 19 }">
          <a-tooltip placement="top">
            <template slot="title">{{ `可选磁盘块数：${diskNumLimits.min} ~ ${diskNumLimits.max}` }}</template>
            <a-input-number v-decorator="decorator.count" :min="diskNumLimits.min" :max="diskNumLimits.max" :step="diskNumLimits.step" />
          </a-tooltip>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script>
import _ from 'lodash'
import utils from './utils'
import { driverLimiations } from './constants'

export default {
  name: 'DiskconfigDialog',
  props: {
    visible: {
      type: Boolean,
      required: true,
    },
    diskSpecs: {
      type: Object,
      required: true,
    },
    imageMsg: {
      type: Object,
      required: true,
    },
  },
  data () {
    let validatorNum = (rule, value, callback) => {
      if (this.diskNumLimits.step === 2 && (value % this.diskNumLimits.step) !== 0) {
        callback(new Error('硬盘数量必须是偶数'))
      }
      callback()
    }
    return {
      form: this.$form.createForm(this),
      disksOptions: [],
      disksPool: {}, // 数据结构： "linux:adapter0:SSD:123123": {num: 10, index: 0} .num表示剩余硬盘，index表示硬盘当前起始索引
      diskForm: { option: [], num: 0 },
      decorator: {
        diskconfig: [
          'diskconfig',
          {
            initialValue: [],
          },
        ],
        count: [
          'count',
          {
            initialValue: 0,
            rules: [
              { validator: validatorNum, trigger: ['blur', 'change'] },
            ],
          },
        ],
      },
    }
  },
  computed: {
    diskNumLimits () {
      let getItem = (lst, value) => lst.find(item => item.value === value)
      if (this.diskForm.option.length === 3) {
        let [v1, v2, v3] = this.diskForm.option
        let l1 = getItem(this.disksOptions, v1)
        let l2 = getItem(l1.children, v2)
        let l3 = getItem(l2.children, v3)
        this.diskForm.num = l3.props.min // eslint-disable-line
        return l3.props
      } else {
        return { max: 0, min: 0, step: 1 }
      }
    },
  },
  created () {
    this.initDiskPool()
    this.updateDisksOptions()
  },
  methods: {
    updateMountPoints (item) {
      item.device_fmts.map((partition) => {
        this.mountPoints.splice(this.mountPoints.indexOf(partition.mountpoint), 1)
      })
    },
    updateDisksOptions () {
      this.disksOptions = []
      // 还原成树结构
      let pool = {}
      _.forEach(this.disksPool, (props, disk) => {
        let [dirver, adapter, device, size] = disk.split(':')
        let l1 = dirver + ':' + adapter
        if (!pool.hasOwnProperty(l1)) {
          pool[l1] = {}
        }
        let l2 = device + ':' + size
        pool[l1][l2] = props.num
      })
      // 生成新的选项
      _.forEach(pool, (l2s, l1) => {
        let dirver = l1.split(':')[0]
        let l1item = { value: l1, label: l1, children: [] }
        _.forEach(l2s, (num, l2) => {
          let [device, size] = l2.split(':')
          let _size = utils.diskFormatter(parseInt(size))
          let l2item = { value: l2, label: device + ':' + _size, children: [] }
          l2item.children = this._getRaidOptions(dirver, num)
          l1item.children.push(l2item)
        })
        this.disksOptions.push(l1item)
      })
    },
    _insertCaps (item) {
      let calcs = {
        none: (size, num) => {
          return [size, 0]
        }, // num 只能是1
        raid0: (size, num) => {
          return [size * num, 0]
        },
        raid1: (size, num) => {
          return [size, num - 1]
        },
        raid5: (size, num) => {
          return [size * (num - 1), 1]
        },
        raid10: (size, num) => {
          return [size * num / 2, 1] // At least 1-drive failure
        },
      }
      let r = calcs[item.raid](item.device_size, item.device_num)
      item.capacity = r[0]
      item.faultTolerance = r[1]
    },
    _addDiskAsItems (item) {
      let len = item.device_num
      if (item.raid === 'none') {
        for (let i = 0; i < len; i++) {
          // 这里要特别注意浅拷贝可能导致的错误
          let newItem = { ...item }
          newItem.device_num = 1
          newItem.device_start_index += i
          newItem.device_fmts = []
          this._addDiskItem(newItem)
        }
      } else {
        this._addDiskItem(item)
      }
    },
    _addDiskItem (item) {
      // 系统盘默认在第一块硬盘
      if (this.value.length === 0) {
        let os = this._newDiskFormatItem()
        os.size = this.image_min_size * 1024
        os.format = '  ' // 系统盘是不能指定格式的。这里空格为了绕过表单校验
        os.mountpoint = '/'
        os.image_id = this.image_id
        this.mountPoints.push('/')
        item.device_fmts.push(os)
      }
      this._insertCaps(item)
      this.value.push(item)
    },
    addDiskItem () {
      this.$refs['diskForm'].validate((valid) => {
        if (valid) {
          let [driver, adapter] = this.diskForm.option[0].split(':')
          let [device, size] = this.diskForm.option[1].split(':')
          let raid = this.diskForm.option[2]
          let item = this._newDiskItem()
          item.driver = driver
          item.adapter = adapter
          item.device = device
          item.device_size = parseInt(size)
          item.device_num = this.diskForm.num
          item.raid = raid
          item.device_start_index = this.disksPool[this.genDiskPoolKey(item)].index
          item.device_fmts = []
          this._addDiskAsItems(item)
          this._delDiskPoolItem(item)
          this.updateDisksOptions()
          this.dialogFormVisible = false
          this.$refs.diskForm.resetFields()
        }
      })
    },
    removeDiskItem (idx) {
      let item = this.value[idx]
      this._addDiskPoolItem(item)
      this.updateMountPoints(item)
      this.updateDisksOptions()
      this.value.splice(idx, 1)
    },
    initDiskPool () {
      this.disksPool = {}
      _.forEach(this.diskSpecs, (adapters, driver) => {
        let item = this._newDiskItem()
        item.driver = driver
        _.forEach(adapters, (disks, adapter) => {
          item.adapter = adapter
          _.forEach(disks, (disk) => {
            item.device = disk.type
            item.device_size = disk.size
            item.device_num = disk.count
            item.device_start_index = disk.start_index
            item.end_index = disk.end_index
            this._addDiskPoolItem(item)
          })
        })
      })
    },
    genDiskPoolKey (item) {
      return `${item.driver}:${item.adapter}:${item.device}:${item.device_size}`
    },
    _newDiskItem () {
      return {
        driver: '',
        adapter: '',
        device: '',
        device_size: 0,
        device_num: 0,
        device_start_index: 0,
      }
    },
    _newDiskFormatItem () {
      return {
        format: '',
        mountpoint: '',
        size: 0,
      }
    },
    _addDiskPoolItem (item) {
      let disk = this.genDiskPoolKey(item)
      if (item.device_num <= 0) {
        console.warn('add disk pool item' + disk + ' num is ' + item.device_num)
        return
      }
      if (this.disksPool.hasOwnProperty(disk)) {
        this.disksPool[disk].index -= item.device_num
        this.disksPool[disk].num += item.device_num
      } else {
        this.disksPool[disk] = {}
        this.disksPool[disk].index = item.device_start_index
        this.disksPool[disk].num = item.device_num
      }
    },
    _delDiskPoolItem (item) {
      let disk = this.genDiskPoolKey(item)
      if (item.device_num <= 0) {
        console.warn('delete disk pool item ' + disk + ' num is ' + item.device_num)
        return
      }
      let newNum = this.disksPool[disk].num - item.device_num
      if (newNum < 0) {
        console.warn('delete disk pool item ' + disk + ' new num is ' + item.device_num)
      } else if (newNum === 0) {
        delete this.disksPool[disk]
      } else {
        this.disksPool[disk].num = newNum
        this.disksPool[disk].index += item.device_num
      }
    },
    _getRaidOptions (dirver, diskNum) {
      let options = []
      let limits = driverLimiations[dirver]
      if (!limits) {
        console.error('unspported driver ' + dirver)
        return options
      }
      _.forEach(limits, (item, k) => {
        if (diskNum >= item.min) {
          let option = { value: item.value, label: item.label, props: { step: item.step || 1, min: item.min || 1 } }
          if (item.max && item.max <= diskNum) {
            option.props.max = item.max
          } else {
            option.props.max = diskNum - (diskNum - option.props.min) % option.props.step
          }
          options.push(option)
        }
      })

      return options
    },
    mountPointFetcher () {
      // 组件内共享mountPoints
      return this.mountPoints
    },
    openForm () {
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs.diskForm.resetFields()
      })
    },
    cancel () {
      this.$emit('update:visible', false)
    },
    submit (e) {
      e.preventDefault()
      this.form.validateFields((err, values) => {
        if (!err) {
          console.log('Received values of form: ', values)
        }
      })
    },
  },
}
</script>
