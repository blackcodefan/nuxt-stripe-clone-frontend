import moment from "moment";

export const state = () => ({
  list: [],
})

export const mutations = {
  set(state, subscriptions) {
    state.list = subscriptions
  },
}

export const actions = {
  async get({ commit, state }, customer) {
    let url = `/api/subscriptions?customer=${customer}`;
    return this.$axios.get(url);
    await this.$axios.get(url)
      .then((res) => {
        if (res.status === 200) {
          console.log('subscriptions', res.data)
          commit('set', res.data.result)
        }
      })
  },
  create(context, subscription) {
    return this.$axios.post('api/subscriptions', subscription);
  },
  update(context, subscription) {
    return this.$axios.put('api/subscriptions/' + subscription.id, subscription);
  },
  cancel(context, data) {
    console.log(data)
    return this.$axios.delete(`api/subscriptions/${data.id}`, {data: {...data}});
  },
  show(context, sub_id) {
    return this.$axios.get(`api/subscriptions/${sub_id}`)
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}
