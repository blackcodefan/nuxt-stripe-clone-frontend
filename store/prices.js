import moment from "moment";

export const state = () => ({
  list: [],
})

export const mutations = {
  set(state, prices) {
    state.list = prices
  },
}

export const actions = {
  async get({ commit, state }, params) {
    let url = `/api/prices`
    await this.$axios.get(url)
      .then((res) => {
        if (res.status === 200) {
          console.log('prices', res.data)
          commit('set', res.data.result)
        }
      })
  },
  create(context, note) {
    return this.$axios.post('api/prices', note);
  },
  update(context, note) {
    return this.$axios.put('api/prices/' + note.uuid, note);
  },
  delete(context, uuid) {
    return this.$axios.delete('api/prices/' + uuid)
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
