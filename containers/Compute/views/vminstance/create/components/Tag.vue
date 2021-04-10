<template>
  <div>
    <div class="tag-list">
      <template v-for="item of tags">
        <span
          class="tag mb-1 d-inline-block"
          :title="item.title"
          :key="`${item.key}${item.value}`"
          :style="{ backgroundColor: item.backgroundColor, color: item.color, borderColor: item.color }">
          <div class="d-flex align-items-center">
            <span class="flex-fill text-truncate">{{ item.title }}</span>
            <a-icon v-if="showRemove(item)" class="ml-1 remove-tag flex-grow-0 flex-shrink-0" type="close" @click="removeTag(item)" />
          </div>
        </span>
      </template>
    </div>
    <a-form-item :extra="$t('compute.text_1146')" class="mt-2">
      <div class="d-flex">
        <div style="line-height: 40px;">
          <tag-select global v-model="checked" :params="params" :button-text="$t('compute.text_1147')" :defaultChecked="defaultChecked" />
          <a-button class="ml-2" v-if="!showForm" @click="() => showForm = true">{{$t('compute.text_18')}}</a-button>
        </div>
        <a-form
          class="ml-2"
          layout="inline"
          :form="tagForm.fc"
          v-if="showForm">
          <a-form-item>
            <a-input v-decorator="decorators.key" :placeholder="$t('compute.text_1148')" />
          </a-form-item>
          <a-form-item>
            <a-input v-decorator="decorators.value" :placeholder="$t('compute.text_1149')" />
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

export default {
  name: 'Tag',
  components: {
    TagSelect,
  },
  props: {
    defaultChecked: {
      type: Object,
    },
  },
  data () {
    return {
      checked: this.defaultChecked || {},
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
        ],
      },
    }
  },
  computed: {
    params () {
      return {
        resources: 'server',
      }
    },
    tags () {
      const ret = []
      R.forEachObjIndexed((value, key) => {
        if (value.length > 0) {
          for (let i = 0, len = value.length; i < len; i++) {
            ret.push(this.genTag(key, value[i]))
          }
        } else {
          ret.push(this.genTag(key, null))
        }
      }, this.checked)
      return ret
    },
  },
  watch: {
    tags (val) {
      let ret
      if (val && val.length > 0) {
        ret = {}
        for (let i = 0, len = val.length; i < len; i++) {
          ret[val[i].key] = val[i].value || ''
        }
      }
      this.$emit('change', ret)
    },
    defaultChecked (val) {
      this.checked = Object.assign({}, this.checked, this.defaultChecked || {})
    },
  },
  methods: {
    async addTag () {
      try {
        const values = await this.tagForm.fc.validateFields()
        const key = `user:${values.key}`
        const newValue = { ...this.checked }
        if (newValue[key]) {
          if (values.value) {
            if (!newValue[key].includes(values.value)) {
              newValue[key] = [values.value]
            }
          }
        } else {
          if (values.value) {
            newValue[key] = [values.value]
          } else {
            newValue[key] = []
          }
        }
        this.checked = newValue
        this.tagForm.fc.resetFields()
      } catch (error) {
        throw error
      }
    },
    genTag (key, value) {
      const rgb = getTagColor(key, value, 'rgb')
      const strRgb = rgb.join(',')
      return {
        title: getTagTitle(key, value),
        color: `rgb(${strRgb})`,
        backgroundColor: `rgba(${strRgb},.1)`,
        key,
        value,
      }
    },
    removeTag (item) {
      const newValue = { ...this.checked }
      delete newValue[item.key]
      this.checked = newValue
    },
    showRemove (item) {
      if (this.defaultChecked && this.defaultChecked[item.key]) {
        return false
      }
      return true
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
