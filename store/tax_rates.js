import moment from "moment";

export const state = () => ({
  list: [],
})

export const mutations = {
  set(state, tax_rates) {
    state.list = tax_rates
  },
}

export const actions = {
  async get({ commit, state }, params) {
    let url = `/api/stripe/tax_rates`
    await this.$axios.get(url)
      .then((res) => {
        if (res.status === 200) {
          console.log('tax_rates', res.data.result.data)
          commit('set', res.data.result.data)
        }
      })
  },
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
