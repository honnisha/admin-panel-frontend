<template>
  <div class="chart-container">

    <div class="inline-filters">
      <Filters
        v-if="method.filterset_fields"
        :settings="settings"
        :filterset-fields="method.filterset_fields"
        :filter-info-init="filterInfo"
        @filtered="handleFilter"
      />
    </div>

      <template v-if="responseData && responseData.messages">
        <v-alert
          v-for="error in responseData.messages"
          :key="error.title"
          :title="error.title"
          :type="error.type"
          density="compact"
          variant="tonal"
        />
      </template>

    <div v-if="responseData">
      <template v-for="chart in responseData.charts">
        <component
          :is="getComponent(chart)"

          :options="chart.options"
          :data="chart"
          :width="chart.options.width"
          :height="chart.options.height"

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

    <template v-if="loadData">
      <div class="chart-loader">
        <v-progress-circular
          :size="50"
          color="primary"
          indeterminate
        ></v-progress-circular>
      </div>
    </template>
  </div>
</template>

<script>
import { toast } from "vue3-toastify"
import { Line as ChartLine, Bar, Bubble, Doughnut, Pie, PolarArea, Radar, Scatter } from "vue-chartjs";
import Filters from '/src/components/Filters.vue'

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
  components: {
    Filters,
  },
  props: {
    settings: {type: Object, required: true},

    pk: {type: String, required: true},
    method: {type: Object, required: true},
  },
  emits: ["changed"],
  data() {
    return {
      loadData: true,
      responseData: null,
      filterInfo: {
        search: null,
        filters: {},
      },
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
  async created() {
    this.getInlineData()
  },
  methods: {
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
    handleFilter(newFilterInfo) {
      this.filterInfo = newFilterInfo
      this.getInlineData()
    },
    getInlineData() {
      this.loadData = true
      this.responseData = null
      const url = this.method.url.replace("{pk}", this.pk)
      getList({
        url: url,
        method: this.method.methodHttp,
        filter_info: this.filterInfo,
      }).then(response => {
        this.responseData = response
        this.loadData = false
      }).catch(error => {
        this.loadData = false
        console.error(`Get inline data error from ${url}:` + error, this.pageInfo)
        toast(error, {
          "theme": "auto",
          "type": "error",
          "position": "top-center",
          "dangerouslyHTMLString": true
        })
      })
    },
  }
}
</script>
