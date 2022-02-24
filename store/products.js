import moment from "moment";

export const state = () => ({
  list: [],
})

export const mutations = {
  set(state, products) {
    state.list = products
  },
}

export const actions = {
  async get({ commit, state }, params) {
    let url = `/api/products`
    await this.$axios.get(url)
      .then((res) => {
        if (res.status === 200) {
          console.log('products', res.data)
          commit('set', res.data.result)
        }
      })
  },
  create(context, note) {
    return this.$axios.post('api/products', note);
  },
  update(context, note) {
    return this.$axios.put('api/products/' + note.uuid, note);
  },
  delete(context, uuid) {
    return this.$axios.delete('api/products/' + uuid)
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
