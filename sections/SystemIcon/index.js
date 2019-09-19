export default {
  name: 'SystemIcon',
  props: {
    tooltip: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  render (h) {
    return (
      <a-tooltip title={ this.tooltip }>
        <span>
          <image-icon image={ this.name } />
        </span>
      </a-tooltip>
    )
  },
}
