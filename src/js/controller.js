import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import { MODAL_CLOSE_SEC } from './config.js';

//polyfilling es6——>es5
import 'core-js/stable';
import 'regenerator-runtime/runtime'; //polyfilling async/await

// api:https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipe = async function () {
  try {
    const id = window.location.hash.slice(1);
    if (!id) return; // guard clause

    recipeView.renderSpinner();
    // 0)update results view to mark seleted search result
    resultsView.update(model.getSearchResultsPage());
    // 1)update bookmarks view
    bookmarksView.update(model.state.bookmarks);
    // 2) load recipe
    await model.loadRecipe(id);
    const { recipe } = model.state;
    // 4) rendering recipe
    recipeView.render(recipe);
  } catch (err) {
    console.error(err);
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    // 1) get the query
    const query = searchView.getQuery();
    if (!query) return; //guard clause
    resultsView.renderSpinner();
    // 2)load search results
    await model.loadSearcgResults(query);
    // 3)render results
    resultsView.render(model.getSearchResultsPage());
    // 4) render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
  }
};
const controlNavigation = function (goToPage) {
  // 1) render new results
  resultsView.render(model.getSearchResultsPage(goToPage));
  // 2)render new pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // update the recipe servings(in state)
  model.updateServings(newServings);
  // update the recipe view
  recipeView.update(model.state.recipe);
};

const controlAddBookMark = function () {
  // 1) add/move bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookMark(model.state.recipe.id);
  // 2)update recipe view
  recipeView.update(model.state.recipe);
  bookmarksView.render(model.state.bookmarks);
};

const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // show loading spinner
    addRecipeView.renderSpinner();
    // update the new recipe data
    await model.uploadRecipe(newRecipe);
    // render recipe
    recipeView.render(model.state.recipe);
    // render message
    addRecipeView.renderMessage();
    // change id in url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);
    // render bookmarks
    bookmarksView.render(model.state.bookmarks);
    // close modal
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 500);
    // render initial form
    setTimeout(function () {
      addRecipeView.render(model.state.recipe);
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('🎇', err);
    addRecipeView.renderError(err.message);
    setTimeout(function () {
      addRecipeView.render(model.state.recipe);
    }, MODAL_CLOSE_SEC * 1000);
  }
};
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks); //initiate bookmarks
  recipeView.addHandlerRender(controlRecipe); //load，hashchange
  recipeView.addHandlerUpdateServings(controlServings); //click serving
  searchView.addHandlerSearch(controlSearchResults); //click search
  paginationView.addHandlerClick(controlNavigation); //click pagination
  recipeView.addHandlerAddBookmark(controlAddBookMark);
  addRecipeView.addHandlerUpload(controlAddRecipe);
};
init();
