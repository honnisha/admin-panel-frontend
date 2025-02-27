<template>
  <div v-if="sectionData">
    <component
      v-if="getInlineComponent()"
      :is="getInlineComponent()"
      :method="apiMethods.list"
      :settings="settings"
    />
    <template v-else>
      Component not found for {{ sectionData.meta.inline_type }}
    </template>
  </div>
</template>

<script>
import ChartInline from '/src/components/inlines/Chart.vue'
import TableInline from '/src/components/inlines/Table.vue'

export default {
  props: {
    apiInfo: {type: Object, required: true},
    settings: {type: Object, required: true},
    viewname: {type: String, required: false},
    group: {type: String, required: false},
  },
  components: {
  },
  data() {
    return {
      sectionData: null,
      apiMethods: null,
    }
  },
  created() {
    this.sectionData = this.apiInfo[this.viewname]
    if (!this.sectionData) {
      console.error(`Page ${this.viewname} not found`)
      this.$router.push({ path: '/404' })
      return
    }
  },
  methods: {
    getInlineComponent() {
      const inline_type = this.sectionData.meta.inline_type
      if (inline_type === 'table') return TableInline
      if (inline_type === 'graph') return ChartInline
      console.error(`Inline not found for inline_type "${inline_type}"`)
    },
  }
}
</script>
