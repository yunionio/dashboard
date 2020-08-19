<template>
  <div class="wrap d-flex align-items-center">
    <draggable v-model="options" tag="ul" class="d-flex flex-fill flex-wrap list-unstyled m-0" handle=".handle">
      <li
        class="item"
        v-for="item in options"
        :key="item.id"
        :class="{ active: current.id === item.id }"
        @click.stop.prevent="$emit('select', item)">
        <icon type="move" class="handle" />
        <span>{{ item.name }}</span>
      </li>
    </draggable>
    <a-button @click="handleRefresh" type="link" icon="sync" class="action-btn" />
    <a-dropdown :trigger="['click']" slot="tabBarExtraContent" placement="bottomRight" v-if="isPrivate">
      <a class="ant-dropdown-link font-weight-bold pl-2 pr-2 h-100 d-block action-btn" @click="e => e.preventDefault()">
        <icon type="more" style="font-size: 18px;" />
      </a>
      <a-menu slot="overlay" @click="handleActionClick">
        <a-menu-item key="handleCreate"><a-icon type="plus" />{{$t('dashboard.text_103')}}</a-menu-item>
        <a-menu-item key="handleEdit" :disabled="isDefaultOption"><a-icon type="edit" />{{$t('dashboard.text_104')}}</a-menu-item>
        <a-menu-item key="handleDownload"><a-icon type="download" />{{$t('dashboard.text_105')}}</a-menu-item>
        <a-menu-item key="handleImport"><a-icon type="file" />{{$t('dashboard.text_106')}}</a-menu-item>
        <a-menu-item key="handleCopy"><a-icon type="copy" />{{$t('dashboard.text_107')}}</a-menu-item>
        <a-menu-item key="handleDelete" :disabled="isDefaultOption"><a-icon type="delete" />{{$t('dashboard.text_108')}}</a-menu-item>
      </a-menu>
    </a-dropdown>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { Base64 } from 'js-base64'
import draggable from 'vuedraggable'
import { download, uuid } from '@/utils/utils'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'DashboardHeader',
  components: {
    draggable,
  },
  mixins: [WindowsMixin],
  props: {
    tabs: {
      type: Array,
      required: true,
    },
    current: {
      type: Object,
      required: true,
    },
    // 当前卡片配置
    data: {
      type: [Array, Object],
      required: true,
    },
    // 检查options配置是否创建过
    checkOptionsCreated: {
      type: Function,
      required: true,
    },
    // 创建初始化配置
    initOptions: {
      type: Function,
      required: true,
    },
    // 是否为默认面板
    isDefaultOption: Boolean,
  },
  data () {
    return {
      isPrivate: process.env.VUE_APP_IS_PRIVATE,
    }
  },
  computed: {
    ...mapGetters(['scope']),
    options: {
      get () {
        return this.tabs
      },
      set (value) {
        this.$emit('update-options', value)
      },
    },
    // 是否只有一个标签
    isSingle () {
      return this.tabs.length === 1
    },
  },
  beforeDestroy () {
    this.pm = null
  },
  created () {
    this.pm = new this.$Manager('parameters', 'v1')
  },
  methods: {
    handleActionClick ({ key }) {
      if (this[key]) this[key]()
    },
    handleCreate () {
      this.$router.push({ name: 'DashboardEdit' })
    },
    handleEdit () {
      this.$router.push({ name: 'DashboardEdit', query: { id: this.current.id } })
    },
    handleDownload () {
      const name = `${this.$t(`policyScopeLabel.${this.scope}`)}_${this.current.name}.ocdb`
      const data = this.genExportData()
      download(data, name)
    },
    handleImport () {
      this.createDialog('DashboardImport', {
        title: this.$t('dashboard.text_106'),
        options: this.options,
        genName: name => this.genName(name),
        checkOptionsCreated: () => this.checkOptionsCreated(),
        initOptions: () => this.initOptions(),
        updateOptions: options => this.$emit('update-options', options),
        selectOption: item => {
          this.$emit('select', item)
        },
      })
    },
    handleDelete () {
      this.createDialog('CommonDialog', {
        header: this.$t('dashboard.text_108'),
        body: () => {
          let number
          if (R.is(Array, this.data)) {
            number = this.data.length
          } else {
            number = Object.keys(this.data).length
          }
          const data = [{
            ...this.current,
            number,
          }]
          return [
            <dialog-selected-tips count={1} action={this.$t('dashboard.text_108')} name={this.$t('dashboard.text_109')} />,
            <dialog-table
              vxeGridProps={{ showOverflow: 'title' }}
              data={ data }
              columns={
                [
                  {
                    field: 'name',
                    title: this.$t('dashboard.text_110'),
                  },
                  {
                    field: 'number',
                    title: this.$t('dashboard.text_111'),
                  },
                ]
              } />,
          ]
        },
        ok: async () => {
          try {
            const newOptions = [...this.options]
            const index = R.findIndex(R.propEq('id', this.current.id))(newOptions)
            if (index !== -1) {
              newOptions.splice(index, 1)
            }
            await this.$emit('update-options', newOptions)
            await this.pm.delete({
              id: this.current.id,
            })
            this.$emit('select', this.options[0])
          } catch (error) {
            throw error
          }
        },
      })
    },
    async handleCopy () {
      try {
        // 检查是否已经创建了dashboard配置
        const optionsCreated = await this.checkOptionsCreated()
        if (!optionsCreated) {
          await this.initOptions()
        }
        // 更新options
        const newOptions = [...this.options]
        const id = `dashboard-${this.scope}-panel-${uuid(16)}`
        const item = {
          name: this.genName(this.current.name),
          id,
        }
        newOptions.push(item)
        await this.$emit('update-options', newOptions)
        // 创建panel数据配置
        const panelData = {}
        if (R.is(Array, this.data)) {
          for (let i = 0, len = this.data.length; i < len; i++) {
            panelData[`dashboard-item-${uuid(32)}`] = this.data[i]
          }
        } else {
          for (const key in this.data) {
            panelData[`dashboard-item-${uuid(32)}`] = this.data[key]
          }
        }
        await this.pm.create({
          data: {
            name: id,
            value: panelData,
          },
        })
        this.$emit('select', item)
      } catch (error) {
        throw error
      }
    },
    // 生成面板名称，如果已存在默认+1
    genName (name) {
      const existNames = this.options.map(item => item.name)
      let num = 1
      let newName = name
      while (existNames.includes(newName)) {
        newName = `${newName}-${num++}`
      }
      return newName
    },
    // 生成导出及克隆的数据
    genExportData () {
      const ret = {
        scope: this.scope,
        name: this.current.name,
        items: [],
      }
      R.forEachObjIndexed((value, key) => {
        ret.items.push(value)
      }, this.data)
      const data = Base64.encode(JSON.stringify(ret))
      return data
    },
    handleRefresh () {
      this.$emit('refresh')
    },
  },
}
</script>

<style lang="less" scoped>
.wrap {
  border-bottom: 1px solid #d8d8d8;
}
.item {
  padding: 12px 16px;
  margin: 0 32px 0 0;
  cursor: pointer;
  position: relative;
  &:last-child {
    margin-right: 0;
  }
  &.active {
    border-bottom: 1px solid #1890ff;
    color: #1890ff;
  }
  &:hover {
    color: #1890ff;
    .handle {
      visibility: visible;
    }
  }
  .handle {
    cursor: move;
    visibility: hidden;
    position: absolute;
    left: 0;
    top: 4px;
    color: rgba(0, 0, 0, 0.65);
  }
}
.action-btn {
  color: rgba(0, 0, 0, 0.65);
  &:hover {
    color: #40a9ff;
  }
}
</style>
