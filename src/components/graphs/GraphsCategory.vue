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
    this.responseData = {
      charts: [
        {
          type: 'line',
          data: {
            labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"],
            datasets: [{
              label: "Dataset #1",
              backgroundColor: "rgba(255,99,132,0.2)",
              borderColor: "rgba(255,99,132,1)",
              borderWidth: 2,
              hoverBackgroundColor: "rgba(255,99,132,0.4)",
              hoverBorderColor: "rgba(255,99,132,1)",
              data: [65, 59, 20, 81, 56, 55, 40],
            },{
              label: "Dataset #2",
              backgroundColor: "rgba(233, 150, 122,0.2)",
              borderColor: "rgba(233, 150, 122,1)",
              borderWidth: 2,
              hoverBackgroundColor: "rgba(233, 150, 122,0.4)",
              hoverBorderColor: "rgba(233, 150, 122,1)",
              data: [30, 35, 29, 15, 3, 10, 22],
            }]
          },
          height: 50,
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: true,
                text: 'Chart.js Line Chart'
              }
            }
          },
        },
        {
          type: 'line',
          data: {
            labels: ["Jun 2016", "Jul 2016", "Aug 2016", "Sep 2016", "Oct 2016", "Nov 2016", "Dec 2016", "Jan 2017", "Feb 2017", "Mar 2017", "Apr 2017", "May 2017"],
            datasets: [{
              label: "Rainfall",
              backgroundColor: 'lightblue',
              borderColor: 'royalblue',
              data: [26.4, 39.8, 66.8, 66.4, 40.6, 55.2, 77.4, 69.8, 57.8, 76, 110.8, 142.6],
            }]
          },
          height: 50,
          options: {
            layout: {
              padding: 10,
            },
            legend: {
              position: 'bottom',
            },
            title: {
              display: true,
              text: 'Precipitation in Toronto'
            },
            scales: {
              yAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: 'Precipitation in mm'
                }
              }],
              xAxes: [{
                scaleLabel: {
                  display: true,
                  labelString: 'Month of the Year'
                }
              }]
            }
          },
        },

        {
          type: 'bar', // 設定圖表類型為長條圖
          data: {
            labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'], // 標籤
            datasets: [{
              label: 'Vote Count', // 數據標題
              data: [12, 19, 3, 5, 2, 3], // 數據
              backgroundColor: [
                'rgba(255, 99, 132, 0.2)', // 紅色
                'rgba(54, 162, 235, 0.2)', // 藍色
                'rgba(255, 205, 86, 0.2)', // 黃色
                'rgba(75, 192, 192, 0.2)', // 綠色
                'rgba(153, 102, 255, 0.2)', // 紫色
                'rgba(255, 159, 64, 0.2)'  // 橙色
              ],
              borderColor: [
                'rgb(255, 99, 132)', // 紅色邊框
                'rgb(54, 162, 235)', // 藍色邊框
                'rgb(255, 205, 86)', // 黃色邊框
                'rgb(75, 192, 192)', // 綠色邊框
                'rgb(153, 102, 255)', // 紫色邊框
                'rgb(255, 159, 64)'   // 橙色邊框
              ],
              borderWidth: 1 // 邊框寬度
            }]
          },
          height: 50,
          options: {
            scales: {
              x: {
                beginAtZero: true, // X 軸從 0 開始
                ticks: {
                  color: '#333' // 設定 X 軸刻度顏色
                }
              },
              y: {
                ticks: {
                  color: '#333' // 設定 Y 軸刻度顏色
                }
              }
            },
            animation: {
              duration: 1500, // 動畫持續時間
              easing: 'easeInOutQuad' // 動畫效果
            }
          }
        }
      ],
    }
  },
  methods: {
    hasFilters() {
      return (
        this.categorySchema.getGraphInfo().search_enabled ||
        Object.keys(this.categorySchema.getGraphInfo().table_filters).length > 0
      )
    },
    handleFilter(newFilterInfo) {
      this.filterInfo = newFilterInfo
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
