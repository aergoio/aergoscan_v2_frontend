<template>
  <div class="transaction-history">
    <div class="title">Transaction History (14 days)</div>
    <div class="content">
      <div class="graph">
        <canvas ref="canvas"></canvas>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js';

export default {
  name: 'TransactionChart',
  props: ['data', 'unit'],
  data () {
    return {
    }
  },
  watch: {
    data(val, oldVal) {
      if (!this.chart) return;
      this.chart.data.datasets[0].data = val;
      this.chart.options.scales.xAxes[0].time.min = 0;
      this.chart.update();
    },
    unit(val, oldVal) {
      if (!this.chart) return;
      this.chart.options.scales.xAxes[0].time.unit = val;
      this.chart.update();
    }
  },
  mounted () {
    let min = 0;
    this.chart = new Chart(this.$refs.canvas, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{
          label: 'Number of tx',
          backgroundColor: 'transparent',
          pointBorderWidth: 1,
          pointBorderColor: '#ff008b',
          borderColor: '#ff008b',
          borderWidth: 1,
          pointRadius: 4,
          lineTension: 0.2,
          data: this.$props.data,
        }]
      },
      options: {
        maintainAspectRatio: false,
        legend: false,
        tooltips: {
          mode: 'index',
          intersect: false,
        },
        hover: {
          mode: 'nearest',
          intersect: true
        },
        scales: {
          yAxes: [{
            gridLines: {},
            ticks: {
              beginAtZero: true,
              padding: 10,
              suggestedMax: 10,
              fontColor: '#9d8ea9'
            }
          }],
          xAxes: [{
            type: 'time',
            gridLines: {
              tickMarkLength: 10,
              drawOnChartArea: false,
            },
            time: {
              unit: this.$props.unit || 'auto',
              min: min
            },
            ticks: {
              padding: 10,
              fontColor: '#9d8ea9'
            }
          }]
        }
      }
    });
  },
};
</script>

<style lang="scss" scoped>
.transaction-history {
  position: relative;
  width: calc(37% - 15px);

  @media screen and (max-width: 1200px) {
    width: 100%;
  }

  .graph {
    position: absolute;
    top: 45px;
    left: 20px;
    bottom: 20px;
    right: 20px;

    @media screen and (max-width: 1200px) {
      position: inherit;
      min-height: 120px;
      margin-top: 10px;
    }
  }
}
</style>

