<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">新增磁盘配置</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item label="配置" v-bind="formItemLayout">
          <a-row :gutter="8">
            <a-col :span="22">
              <a-cascader :options="disksOptions" v-decorator="decorators.option" placeholder="请选择" @change="cascaderChange" />
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
              { required: true, message: '请选择配置项' },
            ],
          },
        ],
        count: [
          'count',
          {
            initialValue: 0,
            rules: [
              { required: true, message: '请选择配置项' },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 8,
        },
        labelCol: {
          span: 2,
        },
      },
      driverLimiations: {
        Linux: [
          {
            value: 'none',
            label: '不做Raid',
            min: 1,
            step: 1,
          },
        ],
        PCIE: [
          {
            value: 'none',
            label: '不做Raid',
            min: 1,
            step: 1,
          },
        ],
        MPT2SAS: [
          {
            value: 'none',
            label: '不做Raid',
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
        MPT3SAS: [
          {
            value: 'none',
            label: '不做Raid',
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
        MegaRaid: [
          {
            value: 'none',
            label: '不做Raid',
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
            label: '不做Raid',
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
            label: '不做Raid',
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
      },
      disksOptions: [],
      maxcount: 0,
      mincount: 0,
      diskData: JSON.parse(JSON.stringify(this.params.diskData)), // 拷贝参数
      diskDataKeys: [...Object.keys(this.params.diskData)],
      step: 1,
      startIndex: 0,
      endIndex: 0,
    }
  },
  computed: {
    coutTitle () {
      return `可选磁盘块数${this.mincount}~${this.maxcount}`
    },
  },
  created () {
    this.handleDiskDate()
  },
  methods: {
    // 组装联动数据
    handleDiskDate () {
      this.diskDataKeys.map(item => {
        const level1 = this.diskData[item]
        const diskDataKeyItem = item
        this.params.diskOptionsDate.forEach(item => {
          level1[item.diskInfo[1]].forEach(item2 => {
            if (item2.type === item.type && sizestr(item2.size, 'M', 1024) === item.unitSize) {
              item2.count = item2.count - item.count
            }
          })
        })
        Object.keys(level1).forEach((key) => {
          let option = {}
          option.value = diskDataKeyItem + ':' + key
          option.label = diskDataKeyItem + ':' + key
          option.children = []
          level1[key].forEach((item) => {
            let optionL2 = {}
            optionL2 = {
              ...item,
              label: item.type + ':' + sizestr(item.size, 'M', 1024),
              value: item.type + ':' + sizestr(item.size, 'M', 1024),
              start_index: item.start_index,
              end_index: item.end_index,
              children: this._getRaidOptions(diskDataKeyItem, item.count),
            }
            if (optionL2.children.length === 0) return
            option.children.push(optionL2)
          })
          if (option.children.length === 0) return
          this.disksOptions.push(option)
        })
      })
    },
    // 计算器
    _getRaidOptions (dirver, diskNum) {
      let options = []
      let limits = this.driverLimiations[dirver]
      if (!limits) {
        return options
      }
      _.forEach(limits, function (item, k) {
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
    // 监听联动改变回调
    cascaderChange (value, selectedOptions) {
      if (selectedOptions) {
        this.maxcount = selectedOptions[2].props.max
        this.mincount = selectedOptions[2].props.min
        this.step = selectedOptions[2].props.step
        this.step = selectedOptions[2].props.step
        this.startIndex = selectedOptions[1].start_index
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
      values['computeCount'] = values.count
      values['start_index'] = this.startIndex
      values['end_index'] = this.endIndex
      this.params.updateData(values)
      this.cancelDialog()
    },
  },
}
</script>
