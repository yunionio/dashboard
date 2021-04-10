<template>
  <div class="edit-wrap d-flex flex-column position-fixed">
    <!-- header -->
    <div class="edit-topbar position-relative d-flex justify-content-center align-items-center flex-grow-0 flex-shrink-0">
      <div class="mr-2">{{$t('dashboard.text_118')}}</div>
      <a-button size="small" type="primary" @click="handleConfirm" :loading="submiting">{{ $t('dialog.ok') }}</a-button>
      <a-button size="small" @click="handleBack" class="ml-2">{{ $t('dialog.cancel') }}</a-button>
    </div>
    <!-- main -->
    <div class="edit-main position-relative flex-fill flex-nowrap align-items-stretch d-flex">
      <!-- extend gallery -->
      <extend-gallery
        ref="extend-gallery"
        class="extend-gallery position-relative" />
      <!-- edit main -->
      <main class="edit-content flex-fill position-relative">
        <div class="edit-content-inner w-100 h-100 position-absolute d-flex flex-column flex-nowrap">
          <div class="edit-header mb-2"><a-input ref="input" v-model="dashboardName" :placeholder="$t('dashboard.text_119')" /></div>
          <grid-shadow
            class="flex-fill"
            ref="grid-shadow">
            <grid-layout
                ref="grid-layout"
                :layout.sync="layout"
                :col-num="colNum"
                :row-height="rowHeight"
                :max-rows="maxRows"
                :vertical-compact="false"
                :is-draggable="true"
                :is-resizable="true"
                :is-mirrored="false"
                :margin="colMargin"
                :use-css-transforms="true">
                <template v-for="item in layout">
                  <grid-item
                    class="edit-grid-item"
                    :x="item.x"
                    :y="item.y"
                    :w="item.w"
                    :h="item.h"
                    :i="item.i"
                    :key="item.i"
                    :is-draggable="!item.isTemplate"
                    :is-resizable="!item.isTemplate"
                    :style="{ outline: item.isTemplate ? '2px dashed darkmagenta' : '' }">
                    <component :is="item.component" :options="item" :params="dashboardParams[item.i]" @update="handleUpdateDashboardParams" edit>
                      <template v-slot:actions="{ handleEdit }">
                        <a-button class="p-0 h-auto" type="link" icon="delete" @click="handleRemove(item)" />
                        <a-button class="p-0 h-auto ml-2" type="link" icon="setting" @click="handleEdit" />
                        <a-button class="p-0 h-auto ml-2" type="link" icon="copy" @click="handleCopy(item, dashboardParams[item.i])" />
                      </template>
                    </component>
                  </grid-item>
                </template>
              </grid-layout>
          </grid-shadow>
        </div>
      </main>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import interact from 'interactjs'
import VueGridLayout from 'vue-grid-layout'
import debounce from 'lodash/debounce'
import GridShadow from '@Dashboard/components/GridShadow'
import ExtendGallery from '@Dashboard/sections/ExtendGallery'
import extendsComponents from '@Dashboard/extends'
import { clear as clearCache } from '@Dashboard/utils/cache'
import { uuid } from '@/utils/utils'
import storage from '@/utils/storage'

export default {
  name: 'DashboardEdit',
  components: {
    GridLayout: VueGridLayout.GridLayout,
    GridItem: VueGridLayout.GridItem,
    GridShadow,
    ExtendGallery,
    ...extendsComponents,
  },
  data () {
    return {
      submiting: false,
      dashboardName: '',
      dashboardParams: {},
      layout: [],
      colNum: 56,
      rowHeight: 65,
      colMargin: [5, 5],
      maxRows: 34,
      defaultGridW: 2,
      defaultGridH: 2,
      currentOption: null,
      dashboardOptions: [],
    }
  },
  computed: {
    ...mapGetters(['scope']),
    id () {
      return this.$route.query.id
    },
    isCreate () {
      return !this.id
    },
  },
  watch: {
    dashboardOptions (val) {
      if (!this.isCreate) {
        const item = R.find(R.propEq('id', this.$route.query.id))(val)
        this.dashboardName = item.name
      }
    },
  },
  destroyed () {
    this.pm = null
    this.debounceUpdateGridItem = null
    clearCache()
  },
  created () {
    this.pm = new this.$Manager('parameters', 'v1')
    this.fetchDashboardOptions()
    if (!this.isCreate) {
      this.fetchDashboard()
    }
  },
  mounted () {
    this.extendGallery = this.$refs['extend-gallery']
    this.editMain = this.$refs['edit-main']
    this.dropzone = this.$refs['grid-shadow'].getContainerRef()
    this.dropzoneRect = this.dropzone.getBoundingClientRect()
    this.dropzoneY = this.dropzoneRect.y
    this.dropzoneX = this.dropzoneRect.x
    this.position = { x: 0, y: 0 }
    this.x = 0
    this.y = 0
    this.copy = null
    this.entered = false
    this.initItemInteract()
    this.initDropzoneInteract()
    this.debounceUpdateGridItem = debounce(this.updateGridItem, 500)
  },
  methods: {
    async fetchDashboardOptions () {
      try {
        const response = await this.pm.get({ id: `dashboard_${this.scope}` })
        if (response.data && response.data.value) {
          this.dashboardOptions = response.data.value || []
        }
        // 如果是新建自动生成面板名称
        if (this.isCreate) {
          this.dashboardName = this.genDashboardName()
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          this.pm.create({
            data: {
              name: `dashboard_${this.scope}`,
              value: [],
            },
          })
        }
        throw error
      }
    },
    async fetchDashboard () {
      try {
        const response = await this.pm.get({ id: this.id })
        if (response.data && response.data.value) {
          this.setData(response.data.value)
        }
      } catch (error) {
        throw error
      }
    },
    updateGridItem (_x, _y) {
      this.$refs['grid-layout'].eventBus.$emit(
        'dragEvent',
        'dragend',
        this.tempId,
        _x,
        _y,
        this.currentOption.w,
        this.currentOption.h,
      )
    },
    initItemInteract () {
      interact('.extend-gallery-item').draggable({
        inertia: true,
        listeners: {
          start: event => {
            event.target.parentNode.parentNode.classList.add('overflow-hidden')
            const component = event.target.dataset.component
            this.setCurrentOption(component)
            this.copy = event.target.cloneNode(true)
            this.copy.classList.add('drag')
            this.copy.style.top = `${event.target.offsetTop}px`
            event.target.parentNode.appendChild(this.copy)
            this.movingGridDeltaY = event.target.getBoundingClientRect().y
            this.tempId = `dashboard-item-${uuid(32)}`
          },
          move: event => {
            this.position.x += event.dx
            this.position.y += event.dy
            this.copy.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`
            this.copy.style.outline = '1px dashed darkmagenta'
            const editContainerScrollTop = document.querySelector('.grid-shadow-wrap').scrollTop
            const { x: _x, y: _y } = (this.calcXY(this.position.y + (this.movingGridDeltaY - 60 + editContainerScrollTop) - this.dropzoneY, this.position.x - this.dropzoneX))
            this.x = _x
            this.y = _y
            if (this.entered) {
              const currentDragGridData = this.layout[this.layout.length - 1]
              currentDragGridData.x = _x
              currentDragGridData.y = _y
              this.debounceUpdateGridItem(_x, _y)
            }
          },
          end: event => {
            event.target.parentNode.removeChild(this.copy)
            event.target.parentNode.parentNode.classList.remove('overflow-hidden')
            this.copy = null
            this.movingGridDeltaY = 0
            this.position = { x: 0, y: 0 }
            this.x = 0
            this.y = 0
          },
        },
      })
    },
    initDropzoneInteract () {
      interact(this.dropzone).dropzone({
        accept: '.extend-gallery-item',
        ondropactivate: event => {
          event.target.classList.add('drop-active')
        },
        ondragenter: event => {
          this.entered = true
          this.layout.push({
            x: 9999,
            y: this.y,
            w: this.currentOption.w,
            h: this.currentOption.h,
            i: this.tempId,
            isTemplate: true,
            component: this.currentOption.component,
          })
        },
        ondragleave: () => {
          this.entered = false
          this.layout.splice(this.layout.length - 1, 1)
        },
        ondrop: () => {
          this.entered = false
          this.layout[this.layout.length - 1].isTemplate = false
        },
        ondropdeactivate: event => {
          event.target.classList.remove('drop-active')
        },
      })
    },
    calcXY (top, left) {
      const colWidth = this.calcColWidth()
      let x = Math.round((left - this.colMargin[0]) / (colWidth + this.colMargin[0]))
      let y = Math.round((top - this.colMargin[1]) / (this.rowHeight + this.colMargin[1]))
      // Capping
      x = Math.max(Math.min(x, this.colNum - this.defaultGridW), 0)
      y = Math.max(Math.min(y, this.maxRows - this.defaultGridH), 0)
      return { x, y }
    },
    calcColWidth () {
      const placeholderGrid = this.$refs['grid-layout'].$children[0]
      return (placeholderGrid.containerWidth - (this.colMargin[0] * (this.colNum + 1))) / this.colNum
    },
    setCurrentOption (component) {
      this.currentOption = {
        component,
        ...this.extendGallery.extendsOptions[component],
      }
    },
    handleRemove (item) {
      const index = R.findIndex(R.propEq('i', item.i))(this.layout)
      this.layout.splice(index, 1)
    },
    handleCopy (item, params) {
      const id = `dashboard-item-${uuid(32)}`
      this.dashboardParams[id] = params
      this.layout.push({
        component: item.component,
        h: item.h,
        i: id,
        w: item.w,
        x: item.x,
        y: item.y,
      })
    },
    handleUpdateDashboardParams (key, params) {
      this.$set(this.dashboardParams, key, params)
    },
    updateDashboardOptions (id) {
      return new Promise((resolve, reject) => {
        const options = [...this.dashboardOptions]
        const index = R.findIndex(R.propEq('id', id))(options)
        if (index !== -1) {
          options[index].name = this.dashboardName
        } else {
          options.push({ id, name: this.dashboardName })
        }
        this.pm.update({
          id: `dashboard_${this.scope}`,
          data: {
            value: options,
          },
        }).then(() => {
          resolve()
        }).catch(error => {
          reject(error)
        })
      })
    },
    createNewDashboard (id) {
      return new Promise((resolve, reject) => {
        this.updateDashboardOptions(id).then(() => {
          this.pm.create({
            data: {
              name: id,
              value: this.genData(),
            },
          }).then(response => {
            resolve(response)
          }).catch(error => {
            reject(error)
          })
        }).catch(error => {
          reject(error)
        })
      })
    },
    async updateDashboard (id) {
      return new Promise((resolve, reject) => {
        this.updateDashboardOptions(id).then(() => {
          this.pm.update({
            id,
            data: {
              value: this.genData(),
            },
          }).then(response => {
            resolve(response)
          }).catch(error => {
            reject(error)
          })
        }).catch(error => {
          reject(error)
        })
      })
    },
    async handleConfirm () {
      if (!R.trim(this.dashboardName)) {
        this.$message.warn(this.$t('dashboard.text_120'))
        this.$refs.input.focus()
        return
      }
      this.submting = true
      try {
        let id = this.id
        let response
        if (this.isCreate) {
          id = `dashboard-${this.scope}-panel-${uuid(16)}`
          response = await this.createNewDashboard(id)
        } else {
          response = await this.updateDashboard(id)
        }
        if (response) {
          storage.set(`__oc_dashboard_${this.scope}__`, { id: response.data.name, name: this.dashboardName })
        }
        this.$router.push('/dashboard')
      } finally {
        this.submting = false
      }
    },
    // 设置视图所需的data
    setData (data) {
      const dashboardParams = {}
      const layout = []
      R.forEachObjIndexed((value, key) => {
        dashboardParams[key] = value.params
        layout.push({
          ...value.layout,
          i: key,
        })
      }, data)
      this.dashboardParams = dashboardParams
      this.layout = layout
    },
    // 生成需要存储到配置中的data
    genData () {
      const ret = {}
      const layouts = this.layout.filter(item => this.dashboardParams[item.i])
      for (let i = 0, len = layouts.length; i < len; i++) {
        const layout = layouts[i]
        ret[layout.i] = {
          layout: {
            x: layout.x,
            y: layout.y,
            w: layout.w,
            h: layout.h,
            component: layout.component,
          },
          params: this.dashboardParams[layout.i],
        }
      }
      return ret
    },
    handleBack () {
      this.$router.push('/')
    },
    // 根据现有的dashboard名称，生成新的dashboard名称（dashboard-1，dashboard-2，...)
    genDashboardName () {
      const reg = /^dashboard-\d+$/g
      const numbers = []
      let max = 1
      R.forEach(item => {
        if (R.test(reg, item.name)) {
          const nameArr = item.name.split('-')
          numbers.push(parseInt(nameArr[1]))
        }
      }, this.dashboardOptions)
      if (numbers.length > 0) {
        max = Math.max(...numbers)
        max += 1
      }
      return `dashboard-${max}`
    },
  },
}
</script>

<style lang="less">
@import url('../../styles/index.scss');
</style>

<style lang="less" scoped>
.edit-wrap {
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  overflow: hidden;
  z-index: 0;
}
.edit-topbar {
  z-index: 5;
  box-shadow: 0 2px 4px 0 rgba(237, 237, 237, 0.5), 0 2px 4px 0 rgba(237, 237, 237, 0.5);
  height: 40px;
}
.edit-main {
  height: calc(100% - 40px);
}
.extend-gallery {
  z-index: 2;
  box-shadow: 4px 0px 5px 1px rgba(237, 237, 237, 0.5);
}
.edit-content {
  overflow: hidden;
  z-index: 1;
}
.edit-content-inner {
  top: 0;
  left: 0;
  z-index: 0;
  overflow: hidden;
  background-color: rgb(250, 250, 250);
  padding: 15px;
}
.edit-header {
  margin-left: 5px;
}

.edit-grid-item {
  user-select: none;
  background: rgba(0, 0, 0, .2);
}
::v-deep .drop-active {
  border: 2px dashed skyblue;
}
::v-deep .drop-active .vue-grid-item.vue-grid-placeholder {
  display: none;
}
</style>
