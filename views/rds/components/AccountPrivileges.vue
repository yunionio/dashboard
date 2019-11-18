<template>
  <div>
    <a-transfer
      :dataSource="dbList"
      :titles="['未授权的数据库', '已授权的数据库']"
      :listStyle="{
        width: '332px',
        height: '332px',
        }"
      :render="renderItem"
      :targetKeys="targetKeys"
      @change="handleChange" />
  </div>
</template>
<script>
import { ACCOUNT_PRIVILEGES } from '../constants'
export default {
  inject: ['form'],
  props: {
    privileges: {
      type: Array,
    },
  },
  data () {
    return {
      mockData: [],
      targetKeys: [],
      dbList: [],
      dbIdItemObj: {},
      propsPrivileges: {},
    }
  },
  created () {
    this.fetchQueryDBList()
    this.form.fc.getFieldDecorator('privileges', { preserve: true })
    if (this.privileges && this.privileges.length > 0) {
      this.privileges.forEach(item => {
        this.propsPrivileges[item.dbinstancedatabase_id] = item
      })
    }
  },
  methods: {
    async fetchQueryDBList () {
      try {
        const manager = new this.$Manager('dbinstancedatabases', 'v2')
        const { status, data } = await manager.list({
          parmas: {
            scope: this.$scope,
            limit: 0,
          },
        })
        if (status === 200 && data.total > 0) {
          const retList = data.data
          this.dbList = retList
            .filter(({ status }) => status === 'running')
            .map(item => {
              item['title'] = item.name
              this.dbIdItemObj[item.id] = item
              if (this.propsPrivileges[item.id]) {
                item = {
                  ...item,
                  ...this.propsPrivileges[item.id],
                }
                this.targetKeys.push(item.id)
              }
              console.log(item, this.propsPrivileges)
              item['key'] = item.id
              return item
            })
        }
      } catch (err) {
        throw err
      }
    },
    renderItemRadions (item) {
      const { id } = item
      const { getFieldDecorator } = this.form.fc
      const renderRadios = ['rw', 'r'].map(v => {
        return <a-radio value={v}>{ACCOUNT_PRIVILEGES[v]}</a-radio>
      })
      const _handleChange = () => {
        this.$nextTick(() => {
          this.setPrivileges()
        })
      }
      return (
        <a-form-item class="radios">
          {
            getFieldDecorator(id, {
              initialValue: item.privileges,
            })(
              <a-radio-group onChange={_handleChange}>
                {renderRadios}
              </a-radio-group>
            )
          }
        </a-form-item>
      )
    },
    renderItem (item) {
      const customLabel = (
        <span class="custom-item">
          <b>{item.title}</b> {this.renderItemRadions(item)}
        </span>
      )

      return {
        label: customLabel, // for displayed item
        value: item.title, // for title and filter matching
      }
    },
    setPrivileges () {
      const values = this.form.fc.getFieldsValue()
      this.form.fc.setFieldsValue({
        privileges: this.targetKeys.map(id => {
          return {
            database: this.dbIdItemObj[id].name,
            privilege: values[id],
          }
        }),
      })
    },
    handleChange (targetKeys) {
      this.targetKeys = targetKeys
      this.setPrivileges()
    },
  },
}
</script>
<style lang="scss">
.ant-transfer {
  .radios {
    display: none;
  }
  .ant-transfer-list:last-child {
    .radios {
      display: block;
      margin-bottom: 0
    }
  }
}
.ant-transfer-list-content-item {
  display: flex;
  > span {
    flex: 1;
  }
  .ant-form-item-control{
      line-height: 28px
  }
}
.custom-item {
  width: 100%;
  display: flex;
  > b {
    flex: 1;
  }
}
</style>
