import FormMixin from '../mixins'

const Fieldset = {
  name: 'JFieldset',
  mixins: [FormMixin],
  render (h) {
    return (
      <div>
        { this.renderItems(h) }
      </div>
    )
  },
  methods: {
    renderItems (h) {
      const { definition } = this

      return (definition.items || definition).map(item => {
        return (
          <j-control path={ this.getPath(item.key) }></j-control>
        )
      })
    },
  },
}

export default Fieldset
