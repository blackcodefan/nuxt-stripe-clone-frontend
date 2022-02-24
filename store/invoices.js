import moment from "moment";

export const state = () => ({
  list: [],
})

export const mutations = {
  set(state, invoices) {
    state.list = invoices
  },
}

export const actions = {
  async get({ commit, state }, params) {
    let url = `/api/invoices?customer=${params.customer}&starting_after=${params.starting_after}`
    return this.$axios.get(url);
    await this.$axios.get(url)
      .then((res) => {
        if (res.status === 200) {
          console.log('invoices', res.data)
          commit('set', res.data.result)
        }
      })
  },
  create(context, invoice) {
    return this.$axios.post('api/invoices', invoice);
  },
  update(context, invoice) {
    return this.$axios.put('api/invoices/' + invoice.uuid, invoice);
  },
  delete(context, { invoiceId, status }) {
    return this.$axios.delete(`api/invoices/${invoiceId}?status=${status}`)
  },
  send(context, id) {
    return this.$axios.get('api/invoices/send/' + id)
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
