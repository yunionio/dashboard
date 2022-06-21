<template>
  <div>
    <a-popover :trigger="trigger" placement="bottomLeft" v-model="visible">
      <div class="icon-content">
        <icon :type="value ? value : options[0].type" class="dashboard-icon" />
      </div>
      <template slot="content">
        <div class="icon-box">
          <div
            v-for="(item, index) in iconArr"
            :key="index"
            @click="handleClick(item)"
            class="icon-content"
            :style="{ borderColor: activeIcon === item.type ? '#268961' : ''}">
            <icon :type="item.type" class="dashboard-icon" />
          </div>
        </div>
      </template>
      <slot name="iconSelect" />
    </a-popover>
  </div>
</template>

<script>
import i18n from '@/locales'

export default {
  name: 'IconPicker',
  props: {
    value: {
      type: String,
    },
    selectProps: { // vue-ant-design a-select 的属性
      type: Object,
      required: false,
      default: () => ({
        placeholder: i18n.t('common.select'),
      }),
    },
    options: {
      type: Array,
    },
    trigger: { // 自定义触发方式
      type: String,
      default: 'click',
      validator: function (value) {
        return ['click', 'hover', 'focus'].indexOf(value) !== -1
      },
    },
  },
  data () {
    return {
      visible: false,
      iconArr: [],
      theme: 'outline',
    }
  },
  computed: {
    activeIcon () {
      return this.value || (this.options && this.options.length > 0 ? this.options[0].type : '')
    },
  },
  watch: {
    visible (val, old) {
      this.iconArr = this.options
    },
    value (v) {
      console.log(v, '---')
      this.syncItem(v)
    },
  },
  mounted () {
    this.iconArr = this.options
  },
  methods: {
    syncItem (value) {
      this.$emit('updateIcon', value)
    },
    handleClick (icon) {
      this.syncItem(icon.type)
      this.visible = false
    },
  },
}
</script>

<style lang="less" scoped>
  @import '~@/styles/less/theme';
  .icon-box{
    overflow: auto;
    font-size: 20px;
    width: 470px;
    height: 230px;
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    align-content: flex-start;
    justify-content: space-around;
  }

  .icon-content{
    width: 80px;
    height: 80px;
    margin:  5px;
    cursor: pointer;
    text-align: center;
    border-radius: 6px;
    border: 1px solid #ccc
  }
  .icon-content:hover{
    border: 1px solid @primary-color
  }
  .dashboard-icon {
    font-size: 77px;
  }
</style>
