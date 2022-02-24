export const state = () => ({ 
  filters:localStorage.getItem('mijnstalling_crm_filters') ? JSON.parse(localStorage.getItem('mijnstalling_crm_filters')) : []
})

export const getters = {
 
  filters: (state) => {
    return state.filters
  }
  
}

export const actions = {


}

export const mutations = {
 
  SET_FILTER(state, filterObject) {    
    const oldFilters = state.filters.find(filter => filter && filter.path !== filterObject.path)    
    if(oldFilters)
      state.filters = [oldFilters]
    else state.filters = []    
    state.filters[state.filters.length] = filterObject   
    state.filters = state.filters
    localStorage.setItem('mijnstalling_crm_filters',JSON.stringify(state.filters))
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
