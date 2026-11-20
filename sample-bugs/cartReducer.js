function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_ITEM":
      state.items.push(action.item);
      return state;
    default:
      return state;
  }
}

module.exports = { cartReducer };
