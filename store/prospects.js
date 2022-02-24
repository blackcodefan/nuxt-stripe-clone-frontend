export const state = () => ({
    prospects: []
})

export const getters = {

    prospects (state) {
        return state.prospects
    },


}

export const actions = {

    getProspects (context) {

        return this.$axios.get('api/prospects').then(response => {
            context.commit('SET_PROSPECTS', response.data.result)
        }).catch(() => {
                //context.commit('SET_FAVORITES', null)
        })

    },

    deleteProspect(context, prospect) {

        this.$axios.delete('api/prospects/' + prospect.uuid).then(response => {
            context.commit('DELETE_PROSPECT', prospect)
        }).catch(error => {
            console.log(error.response)
        })

    }

}

export const mutations = {

    SET_PROSPECTS (state, value) {
        state.prospects = value
    },

    DELETE_PROSPECT(state, appointment) {

    }

}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
}