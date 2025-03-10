<template>
  <div class="container">
    <div v-if="!user">
      <button @click="signInWithGoogle">Login com Google</button>
    </div>
    <div v-else>
      <div class="logo">
        <img src="@/assets/logo.jpg" alt="Logo" class="logo-image" />
      </div>
      <label for="file-upload" class="custom-file-upload">Selecionar arquivo OFX</label>
      <input id="file-upload" type="file" @change="handleFileUpload" accept=".ofx" class="file-input" />

      <!-- Gráfico de Pizza -->
      <div v-if="transactions.length" class="chart-container">
        <canvas ref="pieChart"></canvas>
      </div>

      <!-- Tabela de Transações -->
      <div v-if="transactions.length" class="transaction-table">
        <div class="transaction-row header">
          <div class="transaction-cell">Data</div>
          <div class="transaction-cell">Descrição</div>
          <div class="transaction-cell">Valor</div>
          <div class="transaction-cell">Categoria</div>
          <div class="transaction-cell"></div> <!-- Célula vazia para o botão de exclusão -->
        </div>
        <div v-for="(transaction, index) in transactions" :key="index" class="transaction-row">
          <div class="transaction-cell">{{ formatDate(transaction.date) }}</div>
          <div class="transaction-cell">{{ transaction.description }}</div>
          <div class="transaction-cell">{{ formatCurrency(transaction.amount) }}</div>
          <div class="transaction-cell category">
            <div v-if="editingTransactionId === index" class="select-container">
              <select v-model="transaction.category" @change="saveCategory(index, $event.target.value)">
                <option v-for="category in categories" :key="category" :value="category">
                  {{ category }}
                </option>
              </select>
            </div>
            <div v-else @click="startEditCategory(index)" class="category-chip"
              :style="{ backgroundColor: categoryColors[transaction.category] }">
              {{ transaction.category }}
            </div>
          </div>
          <div class="transaction-cell">
            <button @click="removeTransaction(index)" class="remove-button">
              <i class="fas fa-trash-alt"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { auth, GoogleAuthProvider, signInWithPopup, db, doc, setDoc, getDoc } from "@/firebase";
import { categories } from "@/assets/categories";
import { XMLParser } from "fast-xml-parser";
import Chart from "chart.js/auto";

export default {
  data() {
    return {
      user: null,
      transactions: [],
      pieChart: null,
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
        "Alimentação": "#FF6384", // Vermelho
        "Transporte": "#36A2EB", // Azul
        "Saúde": "#4BC0C0", // Ciano
        "Lazer": "#FFCE56", // Amarelo
        "Educação": "#9966FF", // Roxo
        "Compras": "#FF9F40", // Laranja
        "Outros": "#C9CBCF", // Cinza
      },
      editingTransactionId: null,
    };
  },
  async created() {
    auth.onAuthStateChanged(async (user) => {
      if (user) {
        this.user = user;
        await this.loadTransactions(user.uid);
      }
    });
  },
  methods: {
    async signInWithGoogle() {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        this.user = result.user;
        console.log("Usuário logado:", this.user);
      } catch (error) {
        console.error("Erro ao fazer login:", error);
      }
    },
    async handleFileUpload(event) {
      const file = event.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = async (e) => {
        const content = e.target.result;
        try {
          const parser = new XMLParser();
          const jsonData = parser.parse(content);
          const transactions = jsonData.OFX?.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.BANKTRANLIST?.STMTTRN || [];

          // Processa apenas transações negativas
          this.transactions = this.processTransactions(transactions);

          if (this.user) {
            await this.saveTransactions(this.user.uid, this.transactions);
          }

          // Atualiza o gráfico de pizza após o DOM ser atualizado
          this.$nextTick(() => {
            this.updatePieChart();
          });
        } catch (error) {
          console.error("Erro ao processar OFX", error);
        }
      };
      reader.readAsText(file);
    },
    async saveTransactions(userId, transactions) {
      try {
        const userTransactionsRef = doc(db, "transactions", userId);
        await setDoc(userTransactionsRef, { transactions }, { merge: true });
        console.log("Transações salvas com sucesso!");
      } catch (error) {
        console.error("Erro ao salvar transações:", error);
      }
    },
    async loadTransactions(userId) {
      try {
        const userTransactionsRef = doc(db, "transactions", userId);
        const docSnap = await getDoc(userTransactionsRef);
        if (docSnap.exists()) {
          const allTransactions = docSnap.data().transactions;

          // Filtra apenas transações negativas
          this.transactions = allTransactions.filter(tx => tx.amount < 0);

          console.log("Transações carregadas:", this.transactions);

          // Atualiza o gráfico de pizza após o DOM ser atualizado
          this.$nextTick(() => {
            this.updatePieChart();
          });
        } else {
          console.log("Nenhuma transação encontrada para este usuário.");
        }
      } catch (error) {
        console.error("Erro ao carregar transações:", error);
      }
    },
    processTransactions(transactions) {
      return transactions
        .filter(tx => parseFloat(tx.TRNAMT) < 0)
        .map((tx) => ({
          date: tx.DTPOSTED,
          amount: parseFloat(tx.TRNAMT),
          description: tx.MEMO || "Sem descrição",
          category: this.inferCategory(tx.MEMO || ""),
        }));
    },
    inferCategory(description) {

      // Converte a descrição para minúsculas para facilitar a comparação
      description = description.toLowerCase();

      // Procura por palavras-chave na descrição usando expressões regulares
      for (const { keyword, category } of categories) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'i'); // Procura por palavras inteiras
        if (regex.test(description)) {
          return category;
        }
      }

      // Se nenhuma palavra-chave for encontrada, retorna "Outros"
      return 'Outros';
    },
    formatDate(dateString) {
      if (!dateString) return "-";
      return `${dateString.substring(6, 8)}/${dateString.substring(4, 6)}/${dateString.substring(0, 4)}`;
    },
    // Método para atualizar o gráfico de pizza
    updatePieChart() {
      if (!this.$refs.pieChart) {
        console.error("Elemento <canvas> não encontrado.");
        return;
      }

      if (this.pieChart) {
        this.pieChart.destroy(); // Destrói o gráfico anterior
      }

      const categories = this.getCategoryTotals();
      const ctx = this.$refs.pieChart.getContext("2d");

      // Mapeia as cores das categorias para o gráfico
      const backgroundColors = Object.keys(categories).map(
        (category) => this.categoryColors[category]
      );

      this.pieChart = new Chart(ctx, {
        type: "pie",
        data: {
          labels: Object.keys(categories),
          datasets: [
            {
              label: "Gastos por Categoria",
              data: Object.values(categories),
              backgroundColor: backgroundColors, // Usa as cores dinâmicas
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        },
      });
    },
    // Método para calcular o total gasto por categoria
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
    // Método para iniciar a edição da categoria
    startEditCategory(index) {
      this.editingTransactionId = index;
    },
    // Método para salvar a nova categoria
    async saveCategory(index, newCategory) {
      if (newCategory && this.categories.includes(newCategory)) {
        this.transactions[index].category = newCategory;
        this.editingTransactionId = null; // Finaliza a edição

        // Atualiza a transação no Firestore
        if (this.user) {
          await this.saveTransactions(this.user.uid, this.transactions);
          this.updatePieChart();
        }
      } else {
        console.error("Categoria inválida.");
      }
    },
    async removeTransaction(index) {
      if (confirm("Tem certeza que deseja remover esta transação?")) {
        // Remove a transação da lista
        this.transactions.splice(index, 1);

        // Atualiza o Firestore
        if (this.user) {
          await this.saveTransactions(this.user.uid, this.transactions);
        }

        // Atualiza o gráfico de pizza
        this.$nextTick(() => {
          this.updatePieChart();
        });

        console.log("Transação removida com sucesso!");
      }
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
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  width: 100%;
  height: 100%;
  background: linear-gradient(-45deg, rgb(138, 5, 190) 0%, rgb(83, 0, 130) 100%);
  color: white;
  font-family: Arial, sans-serif;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
}

.container {
  width: 100%;
  max-width: 900px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
  text-align: center;
}

.logo {
  margin-bottom: 20px;
}

.logo-image {
  max-width: 10%;
  height: auto;
}

.custom-file-upload {
  display: inline-block;
  padding: 10px 15px;
  background: #ff4500;
  color: white;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 15px;
}

.file-input {
  display: none;
}

.transaction-table {
  width: 100%;
  margin-top: 20px;
  border-collapse: collapse;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

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

.transaction-row.header {
  font-weight: bold;
  background: rgba(255, 255, 255, 0.2);
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

.category {
  font-weight: bold;
  color: #1e90ff;
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

.chart-container {
  width: 100%;
  max-width: 400px;
  margin: 20px auto;
}

select {
  padding: 8px 12px;
  border-radius: 8px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background-color: rgba(0, 0, 0, 0.7);
  /* Fundo escuro */
  color: white;
  font-size: 14px;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
  appearance: none;
  /* Remove o estilo padrão do navegador */
  -webkit-appearance: none;
  /* Para navegadores baseados em WebKit */
  -moz-appearance: none;
  /* Para Firefox */
}

/* Efeito hover e focus */
select:hover {
  border-color: rgba(255, 255, 255, 0.5);
  background-color: rgba(0, 0, 0, 0.8);
  /* Fundo um pouco mais claro no hover */
}

select:focus {
  border-color: #1e90ff;
  box-shadow: 0 0 8px rgba(30, 144, 255, 0.6);
}

/* Estilo para as options */
select option {
  background-color: rgba(0, 0, 0, 0.9);
  /* Fundo escuro */
  color: white;
  padding: 10px;
}

/* Seta personalizada */
.select-container {
  position: relative;
  display: inline-block;
}

.select-container::after {
  content: "▼";
  position: absolute;
  top: 50%;
  right: 12px;
  transform: translateY(-50%);
  pointer-events: none;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}

.remove-button {
  background: none;
  /* Remove o fundo */
  border: none;
  /* Remove a borda */
  color: #ff4d4d;
  /* Cor vermelha suave */
  cursor: pointer;
  font-size: 16px;
  /* Tamanho do ícone */
  padding: 5px;
  /* Espaçamento interno */
  transition: color 0.3s ease;
  /* Transição suave de cor */
}

.remove-button:hover {
  color: #ff1a1a;
  /* Cor mais vibrante ao passar o mouse */
}

.remove-button i {
  pointer-events: none;
  /* Garante que o ícone não interfira no clique */
}

@media (max-width: 768px) {
  .transaction-row {
    flex-direction: column;
    align-items: center;
  }

  .transaction-cell {
    width: 100%;
    text-align: left;
  }
}
</style>