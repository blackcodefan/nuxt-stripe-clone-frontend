import moment from "moment";

export const state = () => ({
  list: [],
})

export const mutations = {
  set(state, notes) {
    state.list = notes
  },
}

export const actions = {
  async get({ commit, state }, params) {
    let url = `/api/notes?model_id=${params.model_id}&model_type=${params.model_type}&page=${params.page_num}`
    await this.$axios.get(url)
      .then((res) => {
        if (res.status === 200) {
          console.log('notes', res.data)
          commit('set', res.data.result)
        }
      })
  },
  create(context, note) {
    return this.$axios.post('api/notes', note);
  },
  update(context, note) {
    return this.$axios.put('api/notes/' + note.uuid, note);
  },
  delete(context, uuid) {
    return this.$axios.delete('api/notes/' + uuid)
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
