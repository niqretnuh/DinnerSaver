let selectedOptions = new Set();

function toggleOption(option) {
  const button = document.querySelector(`.option-button[data-option="${option}"]`);
  if (selectedOptions.has(option)) {
    selectedOptions.delete(option);
    button.classList.remove('active');
  } else {
    selectedOptions.add(option);
    button.classList.add('active');
  }
}

async function search() {
  //add the search options as parameters, only make the array when the search term is present
  const queryInput = document.getElementById("search-query").value.trim().toLowerCase();
  const query = queryInput ? queryInput.split("/") : [];
  const ingrInput = document.getElementById("search-ingredient").value.trim().toLowerCase();
  const ingr = ingrInput ? ingrInput.split("/") : [];
  const intolInput = document.getElementById("search-intolerance").value.trim().toLowerCase();
  const intol = intolInput ? intolInput.split("/") : [];
  const calInput = document.getElementById("search-calories").value.trim().toLowerCase();
  const cal = calInput ? calInput.split("/") : [];

  //now add the toggle options
  const toggle = Array.from(selectedOptions);
  const toggleStr = toggle.join(',');
  try {
    const apiKey = '84fd24ab466941b3a021659bfb5abfc3';
    const numRecipes = 10;
    let url = `https://api.spoonacular.com/recipes/complexSearch?`;
    //query
    if (query.length > 0) {
      const queryStr = query.join(',');
      url += `query=${queryStr}`;
      console.log(queryStr);
    }
    //toggle
    if(toggle.length > 0){
        url += `&diet=${encodeURIComponent(toggleStr)}`;
    }
    //intolerance
    if (intol.length > 0) {
        const intolStr = intol.join(',');
        url += `&intolerances=${intolStr}`;
    }
    console.log(intol);
    console.log(intol.length);
    //ingredients
    if (ingr.length > 0) {
      const ingrStr = ingr.join(',');
      url += `&includeIngredients=${ingrStr}`;
    }
    //add info
    url += '&addRecipeInformation=true';
    //calories
    if (cal.length > 0) {
      const calStr = cal.join(',');
      url += `&maxCalories=${encodeURIComponent(calStr)}`;
    }
    //num
    url += `&number=${numRecipes}`;
    //key
    url += `&apiKey=${apiKey}`;
    console.log(url);
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('Oops, something went wrong... please try different search terms');
    }
    const data = await response.json();
    const recipes = data.results;
    return recipes;
  } catch (error) {
    console.error(error);
    return []; // Return an empty array if an error occurs
  }
}

async function displaySearchResults(results) {
  const searchResultsDiv = document.getElementById("searchResults");
  searchResultsDiv.innerHTML = ""; 

  //if failed, generate error message
  if (results.length === 0) {
    searchResultsDiv.innerHTML = "<p>Oops, no recipe found... please try different search terms</p>";
    return;
  }

  results.forEach(recipe => {
    const resultDiv = document.createElement("div");
    resultDiv.classList.add("result");

    //write the name
    const nameElement = document.createElement("h2");
    const nameLink = document.createElement("a");
    nameLink.textContent = recipe.title;
    nameLink.href = recipe.sourceUrl;
    nameLink.target = "_blank"; // link in new tab
    nameElement.appendChild(nameLink);
    nameElement.style.fontFamily = "'Josefin Sans', sans-serif";
    nameElement.style.fontWeight = "700";
    nameElement.style.color = "#000";
    nameElement.style.fontSize = "2em";

    //now for the special options
    const vegan = recipe.vegan;
    const vegetarian = recipe.vegetarian;
    const glutenf = recipe.glutenFree;
    const dairyf = recipe.dairyFree;
    const specialElement = document.createElement("p");
    specialElement.textContent = `Vegan: ${vegan}, Vegetarian: ${vegetarian}, Gluten-Free: ${glutenf}, Dairy-Free: ${dairyf}`;

    //the main ingredients
    const ingredientElement = document.createElement("p");
    //const ingredientsList = recipe.extendedIngredients.map(ingredient => ingredient.original);
    let ingredientsList = "";
    const analyzedInstructions = recipe.analyzedInstructions;
    if (analyzedInstructions && analyzedInstructions.length > 0) {
        const ingredients = analyzedInstructions[0].steps[0].ingredients;
        ingredientsList = ingredients.map(ingredient => ingredient.name);
    }  
    //only show the frist five so the website looks cleaner
    const finalIngredientsList = ingredientsList.slice(0,5);
    //in case if the ingredient is less than 2
    if(finalIngredientsList.length > 1){
        ingredientElement.textContent = finalIngredientsList.join(", ") + "...";
    }
    else{
        ingredientElement.textContent = finalIngredientsList + "...";
    }

    //the image
    const imageElement = document.createElement("img");
    imageElement.src = recipe.image;

    resultDiv.appendChild(nameElement);
    resultDiv.appendChild(specialElement);
    resultDiv.appendChild(ingredientElement);
    resultDiv.appendChild(imageElement);

    searchResultsDiv.appendChild(resultDiv);
  });
}

// Function to fetch random recipes from Spoonacular
async function getRandomRecipes() {
  try {
    const apiKey = '84fd24ab466941b3a021659bfb5abfc3';
    const numRecipes = 10; // Number of random recipes to retrieve
    const response = await fetch(`https://api.spoonacular.com/recipes/random?number=${numRecipes}&apiKey=${apiKey}`);
    if (!response.ok) {
      throw new Error('Oops, something went wrong... failed to generate recommendations');
    }
    const data = await response.json();
    const randomRecipes = data.recipes;
    return randomRecipes;
  } catch (error) {
    console.error(error);
    return []; // Return an empty array if an error occurs
  }
}

// Function to display random recipes
async function displayRandomRecipes() {
    //display loading
  const searchResultsDiv = document.getElementById("searchResults");
  searchResultsDiv.innerHTML = "<p>Loading recommended recipes...</p>";
  //clear loading
  const randomRecipes = await getRandomRecipes();
  searchResultsDiv.innerHTML = ""; 
  //if failed, generate error message
  if (randomRecipes.length === 0) {
    searchResultsDiv.innerHTML = "<p>Oops, something went wrong...please try again later</p>";
    return;
  }

  randomRecipes.forEach(recipe => {
    const resultDiv = document.createElement("div");
    resultDiv.classList.add("result");

    //write the name
    const nameElement = document.createElement("h2");
    const nameLink = document.createElement("a");
    nameLink.textContent = recipe.title;
    nameLink.href = recipe.sourceUrl;
    nameLink.target = "_blank"; // link in new tab
    nameElement.appendChild(nameLink);
    nameElement.style.fontFamily = "'Josefin Sans', sans-serif";
    nameElement.style.fontWeight = "700";
    nameElement.style.color = "#000";
    nameElement.style.fontSize = "2em";

    //now for the special options
    const vegan = recipe.vegan;
    const vegetarian = recipe.vegetarian;
    const glutenf = recipe.glutenFree;
    const dairyf = recipe.dairyFree;
    const specialElement = document.createElement("p");
    specialElement.textContent = `Vegan: ${vegan}, Vegetarian: ${vegetarian}, Gluten-Free: ${glutenf}, Dairy-Free: ${dairyf}`;

    //the main ingredients
    const ingredientElement = document.createElement("p");
    const ingredientsList = recipe.extendedIngredients.map(ingredient => ingredient.original);
    //only show the frist five so the website looks cleaner
    const finalIngredientsList = ingredientsList.slice(0,5);
    ingredientElement.textContent = finalIngredientsList.join(", ") + "...";

    //the image
    const imageElement = document.createElement("img");
    imageElement.src = recipe.image;

    resultDiv.appendChild(nameElement);
    resultDiv.appendChild(specialElement);
    resultDiv.appendChild(ingredientElement);
    resultDiv.appendChild(imageElement);

    searchResultsDiv.appendChild(resultDiv);
  });
}

// Add event listener for the search button
const searchButton = document.querySelector('.search-button');
searchButton.addEventListener("click", async () => {
  const query = document.getElementById("search-query").value.trim().toLowerCase().split("/");
  const ingr = document.getElementById("search-ingredient").value.trim().toLowerCase().split("/");
  const intol = document.getElementById("search-intolerance").value.trim().toLowerCase().split("/");
  const cal = document.getElementById("search-calories").value.trim().toLowerCase().split("/");

  if (query.length > 0 || ingr.length > 0 || intol.length > 0 || cal.length > 0 || selectedOptions.size > 0) {
    // If any of the search term is active, call search
    const results = await search();
    displaySearchResults(results);
  } else {
    // If no search is performed at all, display random recipes
    displayRandomRecipes();
  }
});

// Add event listeners for option buttons
document.querySelectorAll('.option-button').forEach(button => {
    const option = button.getAttribute('data-option').toLowerCase();
    button.addEventListener('click', async () => {
      toggleOption(option);
      const results = await search();
      displaySearchResults(results);
    });
});

// Load random recipes on window load
window.addEventListener('load', () => {
  displayRandomRecipes();
});