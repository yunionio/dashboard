<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_323')}}</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('compute.text_295')" v-bind="formItemLayout">
          <a-row :gutter="8">
            <a-col :span="22">
              <a-cascader :options="disksOptions" v-decorator="decorators.option" :placeholder="$t('compute.text_219')" @change="cascaderChange" />
            </a-col>
            <a-col :span="2">
              <a-tooltip :title="coutTitle">
                <a-input-number :min="mincount" :max="maxcount" v-decorator="decorators.count" :step="step" />
              </a-tooltip>
            </a-col>
          </a-row>
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
import { sizestr } from '@/utils/utils'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'BaremetalCreateDiskDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        option: [
          'option',
          {
            rules: [
              { required: true, message: this.$t('compute.text_324') },
            ],
          },
        ],
        count: [
          'count',
          {
            initialValue: 0,
            rules: [
              { required: true, message: this.$t('compute.text_324') },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 8,
        },
        labelCol: {
          span: 4,
        },
      },
      driverLimiations: {
        Linux: [
          {
            value: 'none',
            label: this.$t('compute.text_325'),
            min: 1,
            step: 1,
          },
        ],
        PCIE: [
          {
            value: 'none',
            label: this.$t('compute.text_325'),
            min: 1,
            step: 1,
          },
        ],
        MPT2SAS: [
          {
            value: 'none',
            label: this.$t('compute.text_325'),
            min: 1,
            step: 1,
          },
          {
            value: 'raid0',
            label: 'Raid0',
            min: 2,
            step: 1,
          },
          {
            value: 'raid1',
            label: 'Raid1',
            min: 2,
            max: 2,
            step: 2,
          },
          {
            value: 'raid10',
            label: 'Raid10',
            min: 4,
            max: 10,
            step: 2,
          },
        ],
        Mpt3SAS: [
          {
            value: 'none',
            label: this.$t('compute.text_325'),
            min: 1,
            step: 1,
          },
          {
            value: 'raid0',
            label: 'Raid0',
            min: 2,
            max: 10,
            step: 1,
          },
          {
            value: 'raid1',
            label: 'Raid1',
            min: 2,
            max: 2,
            step: 2,
          },
          {
            value: 'raid10',
            label: 'Raid10',
            min: 4,
            max: 10,
            step: 2,
          },
        ],
        Mpt2SAS: [
          {
            value: 'none',
            label: this.$t('compute.text_325'),
            min: 1,
            step: 1,
          },
          {
            value: 'raid0',
            label: 'Raid0',
            min: 2,
            max: 10,
            step: 1,
          },
          {
            value: 'raid1',
            label: 'Raid1',
            min: 2,
            max: 2,
            step: 2,
          },
          {
            value: 'raid10',
            label: 'Raid10',
            min: 4,
            max: 10,
            step: 2,
          },
        ],
        MegaRaid: [
          {
            value: 'none',
            label: this.$t('compute.text_325'),
            min: 1,
            step: 1,
          },
          {
            value: 'raid0',
            label: 'Raid0',
            min: 1,
            step: 1,
          },
          {
            value: 'raid1',
            label: 'Raid1',
            min: 2,
            max: 2,
            step: 2,
          },
          {
            value: 'raid5',
            label: 'Raid5',
            min: 3,
            step: 1,
          },
          {
            value: 'raid10',
            label: 'Raid10',
            min: 4,
            step: 2,
          },
        ],
        HPSARaid: [
          {
            value: 'none',
            label: this.$t('compute.text_325'),
            min: 1,
            step: 1,
          },
          {
            value: 'raid0',
            label: 'Raid0',
            min: 1,
            step: 1,
          },
          {
            value: 'raid1',
            label: 'Raid1',
            min: 2,
            step: 2,
          },
          {
            value: 'raid5',
            label: 'Raid5',
            min: 3,
            step: 1,
          },
          {
            value: 'raid10',
            label: 'Raid10',
            min: 4,
            step: 2,
          },
        ],
        MarvelRaid: [
          {
            value: 'none',
            label: this.$t('compute.text_325'),
            min: 1,
            step: 1,
          },
          {
            value: 'raid0',
            label: 'Raid0',
            min: 1,
            step: 1,
          },
          {
            value: 'raid1',
            label: 'Raid1',
            min: 2,
            step: 2,
          },
          {
            value: 'raid10',
            label: 'Raid10',
            min: 4,
            step: 2,
          },
        ],
        AdaptecRaid: [
          {
            value: 'none',
            label: this.$t('compute.text_325'),
            min: 1,
            step: 1,
          },
          {
            value: 'raid0',
            label: 'Raid0',
            min: 2,
            step: 1,
          },
          {
            value: 'raid1',
            label: 'Raid1',
            min: 2,
            step: 2,
          },
          {
            value: 'raid10',
            label: 'Raid10',
            min: 4,
            step: 2,
          },
        ],
      },
      disksOptions: [],
      maxcount: 0,
      mincount: 0,
      /*
       * this.params.diskData structure:
       * {
       *  "MegaRaid": {
       *   "adapter0": [
       *    {
       *     "count": 4,
       *     "end_index": 3,
       *     "size": 3814912,
       *     "start_index": 0,
       *     "type": "HDD"
       *    }
       *   ]
       *  }
       * }
       */
      diskData: JSON.parse(JSON.stringify(this.params.diskData)), // 拷贝参数
      raidTypes: [...Object.keys(this.params.diskData)],
      step: 1,
      startIndex: 0,
      endIndex: 0,
    }
  },
  computed: {
    coutTitle () {
      return this.$t('compute.text_326', [this.mincount, this.maxcount])
    },
  },
  created () {
    this.handleDiskDate()
  },
  methods: {
    // 组装联动数据
    handleDiskDate () {
      this.raidTypes.map(raidType => {
        const raidAdapter = this.diskData[raidType]
        this.params.diskOptionsDate.forEach(item => {
          const adapterKey = item.diskInfo[1]
          raidAdapter[adapterKey].forEach(disks => {
            if (disks.type === item.type && sizestr(disks.size, 'M', 1024) === item.unitSize) {
              disks.count = disks.count - item.count
              disks.start_index = disks.start_index + item.count
            }
          })
        })
        Object.keys(raidAdapter).forEach((key) => {
          const option = {}
          option.value = raidType + ':' + key
          option.label = raidType + ':' + key
          option.children = []
          raidAdapter[key].forEach((item) => {
            let optionL2 = {}
            optionL2 = {
              ...item,
              label: item.type + ':' + sizestr(item.size, 'M', 1024),
              value: item.type + ':' + sizestr(item.size, 'M', 1024),
              start_index: item.start_index,
              end_index: item.end_index,
              children: this._getRaidOptions(raidType, item.count),
            }
            if (optionL2.children.length === 0) return
            option.children.push(optionL2)
          })
          if (option.children.length === 0) return
          // 合并同类型
          const keys = []
          option.children.forEach(item => {
            if (!keys.includes(item.value)) {
              keys.push(item.value)
            }
          })
          const children = []
          keys.forEach(key => {
            const target = option.children.filter(item => item.value === key)
            if (target.length === 1) {
              children.push(target[0])
            } else if (target.length > 1) {
              const count = target.reduce((acc, item) => acc + item.count, 0)
              const item = {
                ...target[0],
                count,
                start_index: target[0].start_index,
                end_index: target.reduce((acc, item) => acc + item.end_index, 0) + target.length,
                children: this._getRaidOptions(raidType, count),
              }
              children.push(item)
            }
          })
          option.children = children
          this.disksOptions.push(option)
        })
      })
    },
    // 计算器
    _getRaidOptions (dirver, diskNum) {
      const options = []
      const limits = this.driverLimiations[dirver]
      if (!limits) {
        return options
      }
      _.forEach(limits, function (item, k) {
        if (diskNum >= item.min) {
          const option = { value: item.value, label: item.label, props: { step: item.step || 1, min: item.min || 1 } }
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
    // 监听联动改变回调
    cascaderChange (value, selectedOptions) {
      if (selectedOptions) {
        // e.g. 'MegaRaid:adapter0'
        // const adapterOpt = selectedOptions[0]
        // e.g. 'HDD:3.6T'
        const diskOpt = selectedOptions[1]
        // e.g. 'Raid0'
        const raidOpt = selectedOptions[2]
        this.maxcount = raidOpt.props.max
        this.mincount = raidOpt.props.min
        this.step = raidOpt.props.step
        this.startIndex = diskOpt.start_index
        this.endIndex = diskOpt.end_index
      }
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
    async handleConfirm () {
      const values = await this.validateForm()
      values.computeCount = values.count
      values.start_index = this.startIndex
      values.end_index = this.endIndex
      this.params.updateData(values)
      this.cancelDialog()
    },
  },
}
</script>
