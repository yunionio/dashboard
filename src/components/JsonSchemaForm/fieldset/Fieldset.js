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
        const path = this.getPath(item.key)
        const key = path.join('.')
        return (
          <j-control key={ key } path={ path }></j-control>
        )
      })
    },
  },
}

export default Fieldset
