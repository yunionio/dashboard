<template>
  <div>
    <div class="tag-list">
      <template v-for="item of tags">
        <a-popover trigger="click" v-model="checkedInfo[item.key].visible" :key="`${item.key}${item.value}`" destroyTooltipOnHide @visibleChange="visible => handleTagVisibleChange(item, visible)">
          <template #content>
            <div class="tag-update-wrap">
              <div class="mb-1">{{ $t('common_112') }}</div>
              <div>
                <div><a-input size="small" v-model="checkedInfo[item.key].title" /></div>
                <template v-if="checkedInfo[item.key].titleErrorMessage">
                  <div class="error-color mt-1">{{ checkedInfo[item.key].titleErrorMessage }}</div>
                </template>
              </div>
              <div class="mt-2 mb-1">{{ $t('common_113') }}</div>
              <div><a-input size="small" v-model="checkedInfo[item.key].value" /></div>
              <a-row :gutter="8" class="mt-2">
                <a-col :span="12">
                  <a-button size="small" block @click="updateTag(item)">{{ $t('common.ok') }}</a-button>
                </a-col>
                <a-col :span="12">
                  <a-button size="small" block @click="() => handleTagPopoverCancel(item)">{{ $t('common.cancel') }}</a-button>
                </a-col>
              </a-row>
            </div>
          </template>
          <span
            class="tag mb-1 d-inline-block"
            :title="item.title"
            :style="{ backgroundColor: item.backgroundColor, color: item.color, borderColor: item.color }">
            <div class="d-flex align-items-center">
              <span class="flex-fill text-truncate">{{ item.title }}</span>
              <a-icon class="ml-1 remove-tag flex-grow-0 flex-shrink-0" type="close" @click.stop="removeTag(item)" />
            </div>
          </span>
        </a-popover>
      </template>
    </div>
    <a-form-item :extra="$t('cloudenv.text_594')" class="mt-2">
      <div class="d-flex">
        <div style="line-height: 40px;">
          <tag-select
            :allowNoValue="false"
            global
            v-model="checked"
            :params="params"
            :button-text="$t('compute.text_1147')"
            :defaultChecked="defaultChecked" />
          <pre-defined-tag-select
            v-if="showPreDefinedTagSelect"
            :allowNoValue="false"
            global
            v-model="checked"
            :params="params"
            :defaultChecked="defaultChecked" />
          <a-button class="ml-2" v-if="!showForm" @click="() => showForm = true">{{$t('compute.text_1382')}}</a-button>
        </div>
        <a-form
            layout="inline"
            :form="tagForm.fc"
            v-if="showForm"
            class="ml-2">
            <a-form-item>
              <a-input v-decorator="decorators.key" :placeholder="$t('compute.text_1148')" style="width:130px" />
            </a-form-item>
            <a-form-item>
              <a-input v-decorator="decorators.value" :placeholder="$t('compute.text_1149')" style="width:130px" />
            </a-form-item>
            <a-form-item>
              <a-button @click="addTag">{{$t('compute.text_822')}}</a-button>
              <a-button @click="() => showForm = false" class="ml-2">{{$t('compute.text_135')}}</a-button>
            </a-form-item>
          </a-form>
      </div>
    </a-form-item>
  </div>
</template>

<script>
import * as R from 'ramda'
import { getTagColor, getTagTitle } from '@/utils/common/tag'
import TagSelect from '@/sections/TagSelect'
import PreDefinedTagSelect from '@/sections/TagSelectPreDefined'
import { isCE } from '@/utils/utils'
import { hasPermission } from '@/utils/auth'

export default {
  name: 'Tag',
  components: {
    TagSelect,
    PreDefinedTagSelect,
  },
  props: {
    defaultChecked: {
      type: Object,
    },
  },
  data () {
    const checkedInfo = {}
    this.checkedIndex = 0
    return {
      checked: {},
      showForm: false,
      tagForm: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        key: [
          'key',
          {
            rules: [
              { required: true, whitespace: true, message: this.$t('compute.text_1150') },
            ],
          },
        ],
        value: [
          'value',
          {
            rules: [
              { required: true, whitespace: true, message: this.$t('common.tips.input', [this.$t('common_113')]) },
            ],
          },
        ],
      },
      checkedInfo,
      flag: true,
    }
  },
  computed: {
    showPreDefinedTagSelect () {
      return !isCE() && !this.$store.getters.isSysCE && hasPermission('tags_list')
    },
    params () {
      return {
        resources: 'server',
      }
    },
    tags () {
      let ret = []
      try {
        R.forEachObjIndexed((value, key) => {
          if (value.length > 0) {
            if (R.is(Array, value)) {
              for (let i = 0, len = value.length; i < len; i++) {
                ret.push(this.genTag({ key, value: value[i], index: this.checkedInfo[key].index }))
              }
            } else {
              ret.push(this.genTag({ key, value: value, index: this.checkedInfo[key].index }))
            }
          } else {
            ret.push(this.genTag({ key, value: null, index: this.checkedInfo[key].index }))
          }
        }, this.checked)
        ret = R.sort((a, b) => a.index - b.index, ret)
      } catch (err) {}
      return ret
    },
  },
  watch: {
    tags (val, oldVal) {
      let ret
      if (val && val.length > 0) {
        ret = {}
        for (let i = 0, len = val.length; i < len; i++) {
          ret[val[i].key] = val[i].value || ''
        }
      }
      if ((val && val.length > 0) || (oldVal && oldVal.length > 0)) {
        this.$emit('change', ret)
      }
    },
    defaultChecked: {
      handler: function (val) {
        if (this.flag) {
          this.checked = Object.assign({}, this.checked, this.defaultChecked || {})
          this.flag = false
        }
      },
      immediate: true,
      deep: true,
    },
    checked: {
      handler: function (val) {
        const checkedInfo = { ...this.checkedInfo }
        R.forEachObjIndexed((value, key) => {
          if (!key.startsWith('ext:')) {
            if (checkedInfo[key]) {
              checkedInfo[key] = {
                visible: false,
                title: getTagTitle(key),
                value: value[0],
                titleErrorMessage: '',
                index: checkedInfo[key].index,
              }
            } else {
              const newIndex = this.getMaxIdx(checkedInfo)
              checkedInfo[key] = {
                visible: false,
                title: getTagTitle(key),
                value: value[0],
                titleErrorMessage: '',
                index: newIndex,
              }
            }
          }
        }, val)
        R.forEachObjIndexed((value, key) => {
          if (!val[key]) {
            delete checkedInfo[key]
          }
        }, checkedInfo)
        this.checkedInfo = checkedInfo
      },
      immediate: true,
    },
  },
  methods: {
    getMaxIdx (checkedInfo) {
      let maxIdx = 0
      R.forEachObjIndexed((value, key) => {
        if (value.index && value.index > maxIdx) {
          maxIdx = value.index
        }
      }, checkedInfo)
      return ++maxIdx
    },
    async addTag () {
      try {
        const values = await this.tagForm.fc.validateFields()
        const key = `user:${values.key}`
        const newValue = { ...this.checked }
        const newCheckedInfo = { ...this.checkedInfo }
        if (newValue[key]) {
          if (values.value) {
            if (!newValue[key].includes(values.value)) {
              newValue[key] = [values.value]
              newCheckedInfo[key] = {
                visible: false,
                title: getTagTitle(key),
                value: values.value,
                titleErrorMessage: '',
                index: ++this.checkedIndex,
              }
            }
          }
        } else {
          if (values.value) {
            newValue[key] = [values.value]
            newCheckedInfo[key] = {
              visible: false,
              title: getTagTitle(key),
              value: values.value,
              titleErrorMessage: '',
              index: ++this.checkedIndex,
            }
          } else {
            newValue[key] = []
            newCheckedInfo[key] = {
              visible: false,
              title: getTagTitle(key),
              value: '',
              titleErrorMessage: '',
              index: ++this.checkedIndex,
            }
          }
        }
        this.checked = newValue
        this.checkedInfo = newCheckedInfo
        this.tagForm.fc.resetFields()
      } catch (error) {
        throw error
      }
    },
    genTag (item) {
      const rgb = getTagColor(item.key, item.value, 'rgb')
      const strRgb = rgb.join(',')
      return {
        title: getTagTitle(item.key, item.value),
        color: `rgb(${strRgb})`,
        backgroundColor: `rgba(${strRgb},.1)`,
        ...item,
      }
    },
    removeTag (item) {
      const newValue = { ...this.checked }
      delete newValue[item.key]
      this.checked = newValue
    },
    showRemove (item) {
      // if (this.defaultChecked && this.defaultChecked[item.key]) {
      //   return false
      // }
      return true
    },
    handleTagVisibleChange (item, visible) {
      if (!visible) {
        const newCheckedInfo = { ...this.checkedInfo }
        newCheckedInfo[item.key] = {
          visible: false,
          title: getTagTitle(item.key),
          value: item.value,
          titleErrorMessage: '',
          index: item.index,
        }
        this.checkedInfo = newCheckedInfo
      }
    },
    handleTagPopoverCancel (item) {
      this.checkedInfo[item.key].visible = false
      this.handleTagVisibleChange(item, false)
    },
    updateTag (item) {
      const info = this.checkedInfo[item.key]
      const title = R.trim(info.title)
      const index = info.index
      if (R.isEmpty(title)) {
        info.titleErrorMessage = this.$t('common_116')
        return
      }
      const value = R.trim(info.value || '')
      const newKey = `user:${title}`
      const newCheckedInfo = { ...this.checkedInfo }
      delete newCheckedInfo[item.key]
      newCheckedInfo[newKey] = {
        visible: false,
        title: getTagTitle(newKey),
        value,
        titleErrorMessage: '',
        index,
      }
      this.checkedInfo = newCheckedInfo
      const newCheckedValues = { ...this.checked }
      delete newCheckedValues[item.key]
      newCheckedValues[newKey] = [value]
      this.checked = newCheckedValues
    },
  },
}
</script>

<style lang="less" scoped>
.tag-list {
  min-height: 65px;
  border: 2px dashed #ddd;
  padding: 8px;
}
.tag {
  max-width: 100%;
  line-height: 20px;
  margin-right: 10px;
  padding: 0 6px 0 4px;
  font-size: 12px;
  border-style: solid;
  border-width: 1px;
}
</style>
