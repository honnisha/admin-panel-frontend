<template>
  <div class="list-page">

    <div class="list-above-block">
      <div class="header-row-filters" v-if="hasFilters()">
        <Filters
          :category-schema="categorySchema"
          :filter-info-init="filterInfo"
          @filtered="handleFilter"
          :loading="loading"

          :search-enabled="getGraphInfo().search_enabled"
          :fields-info="getGraphInfo().table_filters.fields"
          :search-help="getGraphInfo().search_help"
        />
      </div>
    </div>

    <div v-if="responseData">
      <template v-for="chart in responseData.charts" v-bind:key="chart">
        <component
          :is="getComponent(chart)"

          :options="chart.options"
          :data="chart.data"
          :width="chart.width"
          :height="chart.height"

          :fill="chart.fill"
          :pointBorderColor="chart.pointBorderColor"
          :borderColor="chart.borderColor"
          :backgroundColor="chart.backgroundColor"
          :pointBorderWidth="chart.pointBorderWidth"
          :tension="chart.tension"
          :borderWidth="chart.borderWidth"
        />
      </template>
    </div>

  </div>
</template>

<script>
import { toast } from "vue3-toastify"
import { CategorySchema } from '/src/api/scheme'
import { getGraphData } from '/src/api/graph'

import { Line as ChartLine, Bar, Bubble, Doughnut, Pie, PolarArea, Radar, Scatter } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
  Filler,
  BarElement,
} from "chart.js";

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  CategoryScale,
  PointElement,
  Filler,
  BarElement,
);

export default {
  props: {
    adminSchema: {type: Object, required: true},
    categorySchema: {type: CategorySchema, required: true},
  },
  components: {
  },
  data() {
    return {
      filterInfo: {
        search: null,
        filters: {},
      },
      loading: false,
      responseData: null,
      types: {
        line: ChartLine,
        bar: Bar,
        bubble: Bubble,
        doughnut: Doughnut,
        pie: Pie,
        polararea: PolarArea,
        radar: Radar,
        scatter: Scatter,
      }
    }
  },
  created() {
    this.updateGraphs()
  },
  methods: {
    updateGraphs() {
      this.loading = true
      getGraphData({
        group: this.categorySchema.group,
        category: this.categorySchema.category,
        filters: this.filterInfo,
      }).then(response => {
        this.loading = false
        this.responseData = response.data
      }).catch(error => {
        this.loading = false
        if (error.response) {

          if (error.response.data.code) {
            toast(this.$t(error.response.data.code), {"theme": "auto", "type": "error", "position": "top-center" })
          } else if (error.response.data.message) {
            toast(this.$t(error.response.data.message), {"theme": "auto", "type": "error", "position": "top-center" })
          }
          console.error('Graph errors', error.response.data)
          return
        }
        toast(`Error: ${error.response.data}`, {"theme": "auto", "type": "error", "position": "top-center"})
      })
    },
    hasFilters() {
      return (
        this.categorySchema.getGraphInfo().search_enabled ||
        Object.keys(this.categorySchema.getGraphInfo().table_filters).length > 0
      )
    },
    handleFilter(newFilterInfo) {
      this.filterInfo = newFilterInfo
      this.updateGraphs()
    },
    getGraphInfo() {
      return this.categorySchema.getGraphInfo()
    },
    getComponent(chart) {
      const chart_type = this.types[chart.type]
      if (chart_type) return chart_type

      const message = `Inline type "${chart.type}" not found`
      toast(message, {
        "theme": "auto",
        "type": "error",
        "position": "top-center",
        "dangerouslyHTMLString": true
      })
    },
  },
}
</script>
