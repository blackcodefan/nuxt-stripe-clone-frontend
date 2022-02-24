export const state = () => ({
  objects: []
})

export const getters = {

  objects(state) {
    return state.objects
  },


}

export const actions = {

  getObjects(context) {

    return this.$axios.get('api/objects').then(response => {
      context.commit('SET_OBJECTS', response.data.result)
    }).catch(() => {
      //context.commit('SET_FAVORITES', null)
    })

  },

  deleteObject(context, object) {

    this.$axios.delete('api/objects/' + object.uuid).then(response => {

      context.commit('DELETE_OBJECT', object)

    }).catch(error => {
      console.log(error.response)
    })

  }

}

export const mutations = {

  SET_OBJECTS(state, value) {
    state.objects = value
  },

  DELETE_OBJECT(state, object) {

  }

}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
