<template>
  <div class="chart-container">
    <canvas ref="pieChart"></canvas>
  </div>
</template>

<script>
import Chart from 'chart.js/auto';

export default {
  props: {
    transactions: {
      type: Array,
      required: true,
    },
    categoryColors: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      pieChart: null,
    };
  },
  watch: {
    transactions: {
      handler: 'updatePieChart',
      deep: true,
    },
  },
  methods: {
    updatePieChart() {
      if (this.pieChart) {
        this.pieChart.destroy(); // Destrua o gráfico anterior se existir
      }

      const categories = this.getCategoryTotals();
      const ctx = this.$refs.pieChart.getContext('2d');

      // Use as cores dinâmicas
      const backgroundColors = Object.keys(categories).map(
        (category) => this.categoryColors[category] || '#C9CBCF' // Cor padrão se não houver cor definida
      );

      this.pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: Object.keys(categories),
          datasets: [
            {
              label: 'Gastos por Categoria',
              data: Object.values(categories),
              backgroundColor: backgroundColors, // Cores dinâmicas
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    },
    getCategoryTotals() {
      const categories = {};
      this.transactions.forEach((tx) => {
        if (categories[tx.category]) {
          categories[tx.category] += tx.amount;
        } else {
          categories[tx.category] = tx.amount;
        }
      });
      return categories;
    },
  },
  mounted() {
    this.updatePieChart();
  },
};
</script>

<style scoped>
.chart-container {
  width: 100%;
  max-width: 400px;
  margin: 20px auto;
}
</style>