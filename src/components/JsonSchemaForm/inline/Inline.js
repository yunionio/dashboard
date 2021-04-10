import FormMixin from '../mixins'

const List = {
  name: 'JInline',
  mixins: [FormMixin],
  render (h) {
    return (
      <a-row>
        { this.renderItems(h) }
      </a-row>
    )
  },
  methods: {
    renderItems (h) {
      const { definition } = this

      return definition.items.map(item => {
        return (
          <a-col span={ item.col }>
            <j-control path={ this.getPath(item.key) }></j-control>
          </a-col>
        )
      })
    },
  },
}

export default List
