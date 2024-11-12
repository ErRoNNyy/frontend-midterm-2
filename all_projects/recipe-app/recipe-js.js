const api_key = "da24893afb224efb83baee2a63f0a895";

document.getElementById('search_input').addEventListener('input', async(event) => {
    const query = event.target.value;
    const response = await fetch(`https://api.spoonacular.com/recipes/autocomplete?number=5&query=${query}&apiKey=${api_key}`);
    const suggestions_input = await response.json();
    const suggestions_menu = document.getElementById('suggestions_menu');
    suggestions_menu.innerHTML = '';
    suggestions_input.forEach(suggestion => {
        const suggested_item = document.createElement('p');
        suggested_item.textContent = suggestion.title;
        suggested_item.onclick = () => recipes_search(suggestion.title);
        suggestions_menu.appendChild(suggested_item);
    }); //suggestion menu when user enters a recipe's title
});

async function recipes_search(query) {
    const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=9&addRecipeInformation=true&apiKey=${api_key}`);
    const output = await response.json();
    const recipe_main = document.getElementById('recipe_main');
    recipe_main.innerHTML = '';
    output.results.forEach(recipe => {
        const recipe_card = document.createElement('div');
        recipe_card.className = 'recipe-card';
        recipe_card.onclick = () => recipe_details(recipe.id);

        const recipe_img = document.createElement('img');
        recipe_img.src = recipe.image;
        recipe_img.alt = recipe.title;

        const recipe_title = document.createElement('h3');
        recipe_title.textContent = recipe.title;

        const time_to_cook = document.createElement('p');
        time_to_cook.textContent = `Prep time: ${recipe.readyInMinutes} mins`;

        const recipe_desc = document.createElement('p');
        recipe_desc.className = 'recipe-desc';
        recipe_desc.textContent = recipe.summary.replace(/(<([^>]+)>)/gi, "");

        //structure of recipe card (div)
        recipe_card.appendChild(recipe_img);
        recipe_card.appendChild(recipe_title);
        recipe_card.appendChild(time_to_cook);
        recipe_card.appendChild(recipe_desc);

        recipe_main.appendChild(recipe_card);
    });
}

async function recipe_details(recipe_id) {
    const response = await fetch(`https://api.spoonacular.com/recipes/${recipe_id}/information?includeNutrition=true&apiKey=${api_key}`);
    const recipe = await response.json();
    const window_content = document.getElementById('window_content_id');
    const nutrients = recipe.nutrition.nutrients;

    let amount_calories = 'N/A';
    let amount_protein = 'N/A';
    let amount_fat = 'N/A';

    nutrients.forEach(n => {
        if (n.name === 'Calories') amount_calories = n.amount;
        if (n.name === 'Protein') amount_protein = n.amount;
        if (n.name === 'Fat') amount_fat = n.amount;
    });

    //structure of window of recipe when user clicks on recipe
    window_content.innerHTML = ` 
        <h2>${recipe.title}</h2>
        <img src="${recipe.image}" alt="${recipe.title}">
        
        <h3>Ingredients</h3>
        <ul>
            ${recipe.extendedIngredients.map(ing => `<li>${ing.original}</li>`).join('')}
        </ul>

        <h3>Instructions</h3>
        <ol>
            ${recipe.analyzedInstructions[0]?.steps.map(step => `<li>${step.step}</li>`).join('') || 'No instructions available.'}
        </ol>

        <h3>Nutritional Information</h3>
        <p>Calories: ${amount_calories} kcal</p>
        <p>Protein: ${amount_protein} g</p>
        <p>Fat: ${amount_fat} g</p>

        <h3>User Ratings & Reviews</h3>
        <p>Average Rating: ${recipe.spoonacularScore || 'No rating available'}</p>
        <button onclick="favorites_add_func(${recipe.id}, '${recipe.title}', '${recipe.image}', ${recipe.readyInMinutes})">Add to Favorites</button>
    `;
    

    document.getElementById('window_details').style.display = 'flex';
}

function close_window() {
    document.getElementById('window_details').style.display = 'none';
}

function favorites_add_func(id, title, image, ready_mins) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    if (!favorites.some(fav => fav.id === id)) {
        const recipe = { id, title, image, ready_mins };
        favorites.push(recipe);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        alert('Recipe added to your favorites successfully!');
    } else {
        alert('Recipe already in favorites!');
    } // to avoid case of adding to favorites again
    show_favorites_list();
}

function delete_from_favorites(id) {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const updatedFavorites = favorites.filter(recipe => recipe.id !== id);
    localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
    show_favorites_list();
    alert('Recipe removed from favorites!');
}

function show_favorites_list() {
    const favorites = JSON.parse(localStorage.getItem('favorites')) || [];
    const favorites_menu = document.getElementById('favorites_menu');
    favorites_menu.innerHTML = '';

    //structure of recipes in favorite menu
    favorites.forEach(recipe => {
        const recipe_card = document.createElement('div');
        recipe_card.className = 'recipe-card';
        recipe_card.onclick = () => recipe_details(recipe.id);

        const recipe_img = document.createElement('img');
        recipe_img.src = recipe.image;
        recipe_img.alt = recipe.title;

        const recipe_title = document.createElement('h3');
        recipe_title.textContent = recipe.title;

        const time_to_cook = document.createElement('p');
        time_to_cook.textContent = `Prep time: ${recipe.ready_mins} mins`;

        const delete_btn = document.createElement('button');
        delete_btn.textContent = 'Delete';
        delete_btn.className = 'delete-btn';
        delete_btn.onclick = (e) => {
            e.stopPropagation(); //makes sure that only delete button is clicked
            delete_from_favorites(recipe.id);
        };

        recipe_card.appendChild(recipe_img);
        recipe_card.appendChild(recipe_title);
        recipe_card.appendChild(time_to_cook);
        recipe_card.appendChild(delete_btn);

        favorites_menu.appendChild(recipe_card);
    });
}

window.onload = show_favorites_list;
