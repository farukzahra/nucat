<template>
    <div class="transaction-row">
      <div class="transaction-cell">{{ formatDate(transaction.date) }}</div>
      <div class="transaction-cell description-cell">{{ transaction.description }}</div>
      <div class="transaction-cell">{{ formatCurrency(transaction.amount) }}</div>
      <div class="transaction-cell category">
        <div v-if="editing" class="select-container">
          <select v-model="selectedCategory" @change="saveCategory">
            <option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </option>
          </select>
        </div>
        <div v-else @click="startEdit" class="category-chip" :style="{ backgroundColor: categoryColors[transaction.category] }">
          {{ transaction.category }}
        </div>
      </div>
      <div class="transaction-cell">
        <button @click="remove" class="remove-button">
          <i class="fas fa-trash-alt"></i>
        </button>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    props: {
      transaction: {
        type: Object,
        required: true,
      },
      index: {
        type: Number,
        required: true,
      },
    },
    data() {
      return {
        editing: false,
        selectedCategory: this.transaction.category,
        categories: [
          "Alimentação",
          "Transporte",
          "Saúde",
          "Lazer",
          "Educação",
          "Compras",
          "Outros",
        ],
        categoryColors: {
          "Alimentação": "#FF6384",
          "Transporte": "#36A2EB",
          "Saúde": "#4BC0C0",
          "Lazer": "#FFCE56",
          "Educação": "#9966FF",
          "Compras": "#FF9F40",
          "Outros": "#C9CBCF",
        },
      };
    },
    methods: {
      startEdit() {
        this.editing = true;
      },
      saveCategory() {
        this.$emit('edit-category', this.index, this.selectedCategory);
        this.editing = false;
      },
      remove() {
        this.$emit('remove-transaction', this.index);
      },
      formatDate(dateString) {
        if (!dateString) return "-";
        return `${dateString.substring(6, 8)}/${dateString.substring(4, 6)}/${dateString.substring(0, 4)}`;
      },
      formatCurrency(value) {
        return value.toLocaleString('pt-BR', {
          style: 'currency',
          currency: 'BRL',
        });
      },
    },
  };
  </script>
  
  <style scoped>
  .transaction-row {
    display: flex;
    justify-content: space-between;
    padding: 12px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    transition: background 0.3s ease;
  }
  
  .transaction-row:hover {
    background: rgba(255, 255, 255, 0.05);
  }
  
  .transaction-cell {
    flex: 1;
    text-align: center;
    padding: 8px;
    word-wrap: break-word;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .description-cell {
    word-break: break-word;
    white-space: normal;
  }
  
  .category-chip {
    padding: 6px 12px;
    border-radius: 20px;
    color: white;
    font-size: 14px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s ease, transform 0.2s ease;
    text-align: center;
  }
  
  .category-chip:hover {
    transform: scale(1.05);
  }
  
  .remove-button {
    background: none;
    border: none;
    color: #ff4d4d;
    cursor: pointer;
    font-size: 16px;
    padding: 5px;
    transition: color 0.3s ease;
  }
  
  .remove-button:hover {
    color: #ff1a1a;
  }
  </style>