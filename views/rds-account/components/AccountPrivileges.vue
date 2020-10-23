<template>
  <div>
    <a-transfer
      :dataSource="dbList"
      :titles="[$t('db.text_193'), $t('db.text_194')]"
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
import { RDS_ACCOUNT_PRIVILEGES } from '@DB/constants'
export default {
  inject: ['form'],
  props: {
    privileges: {
      type: Array,
    },
    rdsItem: {
      type: Object,
      default: () => {
        return {}
      },
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
        const params = {
          scope: this.$store.getters.scope,
          limit: 0,
          dbinstance: this.rdsItem.id,
        }
        const manager = new this.$Manager('dbinstancedatabases', 'v2')
        const { status, data } = await manager.list({ params })
        if (status === 200 && data.total > 0) {
          const retList = data.data
          this.dbList = retList
            .filter(({ status, name }) => status === 'running')
            .map(item => {
              item.title = item.name
              this.dbIdItemObj[item.id] = item
              if (this.propsPrivileges[item.id]) {
                item = {
                  ...item,
                  ...this.propsPrivileges[item.id],
                }
                this.targetKeys.push(item.id)
              }
              item.key = item.id
              return item
            })
          this.setPrivileges()
        }
      } catch (err) {
        throw err
      }
    },
    renderItemRadions (item) {
      const { id } = item
      const { getFieldDecorator } = this.form.fc
      const renderRadios = ['rw', 'r'].map(v => {
        return <a-radio value={v}>{RDS_ACCOUNT_PRIVILEGES[v]}</a-radio>
      })
      const _handleChange = () => {
        this.$nextTick(() => {
          this.setPrivileges()
        })
      }
      const initialValue = (item.privileges === 'rw' || item.privileges === 'r') ? item.privileges : 'rw'
      return (
        <a-form-item class="radios">
          {
            getFieldDecorator(id, {
              initialValue,
            })(
              <a-radio-group onChange={_handleChange}>
                {renderRadios}
              </a-radio-group>,
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
        label: customLabel,
        value: item.title,
      }
    },
    setPrivileges () {
      const values = this.form.fc.getFieldsValue()
      this.form.fc.setFieldsValue({
        privileges: this.targetKeys.map(id => {
          return {
            database: this.dbIdItemObj[id].name,
            privilege: values[id] || this.dbIdItemObj[id].name,
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
<style lang="less">
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
  line-height: 30px;
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
