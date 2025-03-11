// src/store/index.js
import { createStore } from 'vuex';
import { auth, db, doc, getDoc } from '@/firebase';

const store = createStore({
  state: {
    user: null,
    transactions: [],
  },
  mutations: {
    SET_USER(state, user) {
      state.user = user;
    },
    SET_TRANSACTIONS(state, transactions) {
      state.transactions = transactions;
    },
    ADD_TRANSACTION(state, transaction) {
      state.transactions.push(transaction);
    },
    REMOVE_TRANSACTION(state, index) {
      state.transactions.splice(index, 1);
    },
    UPDATE_TRANSACTION_CATEGORY(state, { index, category }) {
      state.transactions[index].category = category;
    },
  },
  actions: {
    async loadUserAndTransactions({ commit }, user) {
      commit('SET_USER', user);

      if (user) {
        try {
          const userTransactionsRef = doc(db, 'transactions', user.uid);
          const docSnap = await getDoc(userTransactionsRef);
          if (docSnap.exists()) {
            const transactions = docSnap.data().transactions.filter(tx => tx.amount < 0);
            commit('SET_TRANSACTIONS', transactions);
          }
        } catch (error) {
          console.error('Erro ao carregar transações:', error);
        }
      }
    },
    async logout({ commit }) {
      try {
        await auth.signOut();
        commit('SET_USER', null);
        commit('SET_TRANSACTIONS', []);
        localStorage.removeItem('vuex-state');
      } catch (error) {
        console.error('Erro ao fazer logout:', error);
      }
    },
  },
  getters: {
    user: (state) => state.user,
    transactions: (state) => state.transactions,
  },
});

// Plugin para persistir o estado no LocalStorage
store.subscribe((mutation, state) => {
  localStorage.setItem('vuex-state', JSON.stringify(state));
});

// Recupera o estado salvo no LocalStorage ao carregar a página
const savedState = localStorage.getItem('vuex-state');
if (savedState) {
  store.replaceState(JSON.parse(savedState));
}

export default store;