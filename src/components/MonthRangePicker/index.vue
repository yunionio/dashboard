<template>
  <div style="position: relative" @click="handleClick">
    <a-range-picker
      v-model="value"
      format="YYYY-MM"
      :open="false"
      :mode="['month', 'month']"
      @openChange="showPanel" />
    <!-- <transion name="fade"> -->
    <div v-if="visible" ref="panel" style="position:absolute;left:0px;top:0px;z-index:100;height:500px">
      <div class="ant-calendar-picker-container ant-calendar-picker-container-placement-bottomLeft">
        <div class="ant-calendar ant-calendar-range ant-calendar-picker-container-content">
          <div class="ant-calendar-panel">
            <div class="ant-calendar-date-panel">
              <div class="ant-calender-input-wrap">
                <div class="ant-calender-date-input-wrap d-flex align-items-center">
                  <input v-model="textLeft" type="text" class="ant-calender-input" style="width:150px" />
                  <span class="ml-2 mr-2">~</span>
                  <input v-model="textRight" type="text" class="ant-calender-input" />
                </div>
              </div>
              <div class="ant-calendar-range-part ant-calendar-range-left">
                <div style="outline:none">
                  <div class="ant-calendar-month-panel-header">
                    <div style="position: relative;">
                      <a role="button" :title="$t('common_custom_date.prev_year')" class="ant-calendar-month-panel-prev-year-btn" @click="handleYearChange('currentLeftYear', -1)" />
                      <span class="ant-calendar-month-panel-year-select-current">{{ currentLeftYear }}</span>
                      <a v-if="currentRightYear - currentLeftYear > 1" role="button" :title="$t('common_custom_date.next_year')" class="ant-calendar-month-panel-next-year-btn" @click="handleYearChange('currentLeftYear', 1)" />
                    </div>
                  </div>
                  <div class="ant-calendar-month-panel-body">
                    <table cellspacing="0" role="grid" class="ant-calendar-month-panel-table">
                      <tbody class="ant-calendar-month-panel-tbody">
                        <tr role="row" v-for="(row, index) in panelOpts.left" :key="index">
                          <td
                            v-for="(item, index2) in row" role="gridcell"
                            :key="`${index}-${index2}`"
                            :title="item.label"
                            :class="{
                              'ant-calendar-month-panel-cell': true,
                              'ant-calendar-month-panel-selected-cell': selected.includes(item.value) || item.showSelectedShadow,
                              'ant-calendar-month-in-range-cell': item.showShadow,
                            }">
                            <a
                              class="ant-calendar-month-panel-month"
                              @click="(e) => handleMonthClick(e, item.value)"
                              @mouseover="handleMonthOver(item.value)">
                              {{ item.label }}
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              <div class="ant-calendar-range-part ant-calendar-range-right">
                <div style="outline:none">
                  <div class="ant-calendar-header">
                    <div style="position: relative;">
                      <a v-if="currentRightYear - currentLeftYear > 1" role="button" :title="$t('common_custom_date.prev_year')" class="ant-calendar-month-panel-prev-year-btn" @click="handleYearChange('currentRightYear', -1)" />
                      <span class="ant-calendar-month-panel-year-select-current">{{ currentRightYear }}</span>
                      <a role="button" :title="$t('common_custom_date.next_year')" class="ant-calendar-month-panel-next-year-btn" @click="handleYearChange('currentRightYear', 1)" />
                    </div>
                  </div>
                  <div class="ant-calendar-body">
                    <table cellspacing="0" role="grid" class="ant-calendar-month-panel-table">
                      <tbody class="ant-calendar-month-panel-tbody">
                        <tr role="row" v-for="(row, index) in panelOpts.right" :key="index">
                          <td
                            v-for="(item, index2) in row" role="gridcell"
                            :key="`${index}-${index2}`"
                            :title="item.label"
                            :class="{
                              'ant-calendar-month-panel-cell': true,
                              'ant-calendar-month-panel-selected-cell': selected.includes(item.value) || item.showSelectedShadow,
                              'ant-calendar-month-in-range-cell': item.showShadow,
                            }">
                            <a
                              class="ant-calendar-month-panel-month"
                              @click="(e) => handleMonthClick(e, item.value)"
                              @mouseover="handleMonthOver(item.value)">
                              {{ item.label }}
                            </a>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- </transion> -->
  </div>
</template>

<script>
export default {
  name: 'MonthRangePicker',
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: Array,
    panelVisible: Boolean,
  },
  data () {
    let currentLeftYear = parseInt(this.$moment().format('YYYY'))
    let currentRightYear = parseInt(this.$moment().add(1, 'year').format('YYYY'))
    let value1 = null
    let value2 = null
    let textLeft = ''
    let textRight = ''
    if (this.value && this.value.length === 2 && this.value[0] && this.value[1]) {
      currentLeftYear = parseInt(this.$moment(this.value[0]).format('YYYY'))
      const rightYear = parseInt(this.$moment(this.value[1]).format('YYYY'))
      currentRightYear = rightYear === currentLeftYear ? rightYear + 1 : rightYear
      value1 = parseInt(this.$moment(this.value[0]).format('YYYYMM'))
      value2 = parseInt(this.$moment(this.value[1]).format('YYYYMM'))
      textLeft = this.$moment(this.value[0]).format('YYYY-MM')
      textRight = this.$moment(this.value[1]).format('YYYY-MM')
    }
    return {
      visible: false,
      currentLeftYear,
      currentRightYear,
      showValue: [value1, value2],
      selected: [value1, value2],
      changeIndex: 0,
      hoverValue: null,
      textLeft,
      textRight,
    }
  },
  computed: {
    panelOpts () {
      const ret = { left: [], right: [] }
      let start = 1
      for (let i = 1; i <= 4; i++) {
        const leftRow = []
        const rightRow = []
        for (let j = 1; j <= 3; j++) {
          const left = {
            label: this.$t(`common_custom_date.month.${start}`),
            value: parseInt(this.$moment(`${this.currentLeftYear}-${start < 10 ? '0' : ''}${start}`).format('YYYYMM')),
          }
          const right = {
            label: this.$t(`common_custom_date.month.${start}`),
            value: parseInt(this.$moment(`${this.currentRightYear}-${start < 10 ? '0' : ''}${start}`).format('YYYYMM')),
          }
          left.showShadow = this.getShadowShow(left.value)
          right.showShadow = this.getShadowShow(right.value)
          left.showSelectedShadow = this.getSelectedShadowShow(left.value)
          right.showSelectedShadow = this.getSelectedShadowShow(right.value)
          leftRow.push(left)
          rightRow.push(right)
          start++
        }
        ret.left.push(leftRow)
        ret.right.push(rightRow)
      }
      return ret
    },
    selectedMoment () {
      const left = String(this.selected[0] || this.value1)
      const right = String(this.selected[1] || this.value2)
      if (left.length && right.length) {
        return [this.$moment(`${left.slice(0, 4)}-${left.slice(4)}`), this.$moment(`${right.slice(0, 4)}-${right.slice(4)}`)]
      }
      return [null, null]
    },
  },
  watch: {
    panelVisible (val) {
      if (!val) this.visible = false
    },
    visible (val) {
      if (!val) {
        this.hoverValue = null
        this.changeIndex = 0
        if (this.value && this.value.length === 2 && this.value[0] && this.value[1]) {
          this.selected = [parseInt(this.$moment(this.value[0]).format('YYYYMM')), parseInt(this.$moment(this.value[1]).format('YYYYMM'))]
          this.textLeft = this.$moment(this.value[0]).format('YYYY-MM')
          this.textRight = this.$moment(this.value[1]).format('YYYY-MM')
        } else {
          this.selected = []
          this.textLeft = ''
          this.textRight = ''
        }
      }
    },
  },
  created () {
    this.$bus.$on('app-action', function (e) {
      if (this.visible && this.$refs.panel && !this.$refs.panel.contains) {
        this.visible = false
      }
    })
  },
  methods: {
    getShadowShow (value) {
      if (this.hoverValue && this.selected[0] && !this.selected[1]) {
        return (value > this.selected[0] && value < this.hoverValue) || (value > this.hoverValue && value < this.selected[0])
      }
      if (this.selected[0] && this.selected[1] && value > this.selected[0] && value < this.selected[1]) {
        return true
      }
      if (this.selected[0] && !this.selected[1] && value > this.selected[0]) {
        return true
      }
      return false
    },
    getSelectedShadowShow (value) {
      if (this.hoverValue && value === this.hoverValue) {
        return true
      }
      return false
    },
    showPanel (e) {
      this.visible = true
    },
    hiddenPanel () {
      this.visible = false
    },
    handleClick (e) {
      this.showPanel()
      e.preventDefault()
      e.stopPropagation()
    },
    handleYearChange (type, num) {
      this[type] = this[type] + num
    },
    handleMonthClick (e, value) {
      if (this.changeIndex === 0) {
        this.selected = [value, null]
        this.changeIndex = 1
        if (!this.textLeft) {
          const left = String(this.selected[0])
          this.textLeft = `${left.slice(0, 4)}-${left.slice(4)}`
        }
      } else {
        if (this.selected[0] > value) {
          this.selected = [value, this.selected[0]]
        } else {
          this.selected = [this.selected[0], value]
        }
        if (!this.textRight || !this.textLeft) {
          const left = String(this.selected[0])
          const right = String(this.selected[1])
          this.textLeft = `${left.slice(0, 4)}-${left.slice(4)}`
          this.textRight = `${right.slice(0, 4)}-${right.slice(4)}`
        }
        this.changeIndex = 0
        const that = this
        this.$nextTick(() => {
          this.$emit('change', this.selectedMoment)
          that.visible = false
        })
      }
      this.hoverValue = null
      if (e) {
        e.preventDefault()
        e.stopPropagation()
      }
    },
    handleMonthOver (value) {
      if (this.selected[0] && this.selected[1]) return
      this.hoverValue = value
    },
    handleMonthOut (value) {
      this.hoverValue = null
    },
  },
}
</script>

<style lang="less" scoped>

.fade-enter-active, .fade-leave-active {
  transition: opacity 5s;
}
.fade-enter, .fade-leave-to {
  opacity: 0;
}
.ant-calendar-picker-container {
  border-radius: 4px;
}
.ant-calendar-month-panel-prev-year-btn {
  position: absolute;
  left: 10px;
  padding: 0 5px;
  color: rgba(0,0,0,.45);
  font-size: 16px;
  font-family: Arial,Hiragino Sans GB,Microsoft Yahei,"Microsoft Sans Serif",sans-serif;
  line-height: 40px;
}
.ant-calendar-month-panel-next-year-btn {
  position: absolute;
  right: 10px;
  padding: 0 5px;
  color: rgba(0,0,0,.45);
  font-size: 16px;
  font-family: Arial,Hiragino Sans GB,Microsoft Yahei,"Microsoft Sans Serif",sans-serif;
  line-height: 40px;
}
.ant-calendar-month-panel-prev-year-btn:before {
    position: relative;
    top: -1px;
    display: inline-block;
    width: 8px;
    height: 8px;
    vertical-align: middle;
    border: 0 solid #aaa;
    border-width: 1.5px 0 0 1.5px;
    border-radius: 1px;
    transform: rotate(-45deg) scale(.8);
    transition: all .3s;
    content: "";
}

.ant-calendar-month-panel-prev-year-btn:after {
    // display: none;
    position: relative;
    left: -3px;
    display: inline-block;
    position: relative;
    top: -1px;
    display: inline-block;
    width: 8px;
    height: 8px;
    vertical-align: middle;
    border: 0 solid #aaa;
    border-width: 1.5px 0 0 1.5px;
    border-radius: 1px;
    transform: rotate(-45deg) scale(.8);
    transition: all .3s;
    content: "";
}

.ant-calendar-month-panel-next-year-btn:before {
    position: relative;
    left: 3px;
    position: relative;
    top: -1px;
    display: inline-block;
    width: 8px;
    height: 8px;
    vertical-align: middle;
    border: 0 solid #aaa;
    border-width: 1.5px 0 0 1.5px;
    border-radius: 1px;
    transform: rotate(135deg) scale(.8);
    transition: all .3s;
    content: "";
}

.ant-calendar-month-panel-next-year-btn:after {
    display: inline-block;
    position: relative;
    // left: -3px;
    display: inline-block;
    position: relative;
    top: -1px;
    display: inline-block;
    width: 8px;
    height: 8px;
    vertical-align: middle;
    border: 0 solid #aaa;
    border-width: 1.5px 0 0 1.5px;
    border-radius: 1px;
    transform: rotate(135deg) scale(.8);
    transition: all .3s;
    content: "";
}
// .ant-calendar-month-panel-year-select-current {
//     display: inline-block;
//     padding: 0 2px;
//     color: rgba(0,0,0,.85);
//     font-weight: 500;
//     line-height: 40px;
// }

.ant-calendar-month-panel-cell {
  position: relative;
}
.ant-calendar-month-in-range-cell::before {
    position: absolute;
    top: 12px;
    right: 0;
    bottom: 12px;
    left: 0;
    display: block;
    background: #e6f7ff;
    border: 0;
    border-radius: 0;
    content: "";
}
.ant-calendar-month-panel-month {
  position: relative;
  z-index: 1;
}
.ant-calender-input-wrap {
  border-bottom: 1px solid #e8e8e8;
  padding: 6px 10px;
}
.ant-calender-input {
    position: relative;
    display: inline-block;
    width: 100%;
    height: 32px;
    color: rgba(0,0,0,.65);
    font-size: 14px;
    line-height: 1.5;
    background-color: #fff;
    background-image: none;
    border-radius: 4px;
    transition: all .3s;
    height: 24px;
    padding: 4px 0;
    line-height: 24px;
    border: 0;
    box-shadow: none;
}
.ant-calender-input:focus {
  outline: none;
}
</style>
