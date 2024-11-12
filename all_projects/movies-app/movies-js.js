const api_key = "6cd8f8ab28a65ffe2d15312ad6d3e9f7";

const input_search = document.getElementById('search-input');
const movie_container = document.getElementById('movie-container');
const suggestion_list = document.getElementById('suggestion-id');
const movie_window = document.getElementById('movie-window');
const close_window = document.getElementById('close-window');
const movie_title = document.getElementById('movie-title');
const category_button = document.getElementById('category-button');
const genre_dropdown_list = document.getElementById('genre-dropdown');
const watchlist_button = document.getElementById('watchlist-button');
const watchlist_window = document.getElementById('watchlist-window');
const close_watchlist = document.getElementById('close-watchlist');
const watchlist_content = document.getElementById('watchlist-content');
const movie_overview = document.getElementById('movie-overview');
const movie_rating = document.getElementById('movie-rating');
const movie_runtime = document.getElementById('movie-runtime');
const movie_cast = document.getElementById('movie-cast');
const movie_poster = document.getElementById('movie-poster');
const add_to_watchlist_button = document.getElementById('add-to-watchlist-btn');


watchlist_button.onclick = () => {
    display_watchlist();
    watchlist_window.style.display = 'flex';
};

close_watchlist.onclick = () => {
    watchlist_window.style.display = 'none';
};

input_search.addEventListener('input', async (e) => {
    const user_query = e.target.value;
    if (user_query.length >= 1) {
        const movies = await fetch_movies_func(user_query);
        suggestions_menu_show(movies);
    } else {
        suggestion_list.innerHTML = '';
    }
});

category_button.onclick = () => {
    genre_dropdown_list.classList.toggle('show');
};

document.addEventListener('click', (e) => {
    if (
        !genre_dropdown_list.contains(e.target) &&
        !category_button.contains(e.target)
    ) {
        genre_dropdown_list.classList.remove('show');
    }
}); //closing the dropdown when clicks the outside of dropdown list

genre_dropdown_list.addEventListener('click', async (e) => {
    if (e.target.tagName === 'LI') {
        const genre_id = e.target.getAttribute('genre-id');
        const movies = await fetch_genre_func(genre_id);
        movies_show(movies);
        genre_dropdown_list.classList.remove('show');
    }
});


async function fetch_movies_func(query) {
    const response = await fetch(`https://api.themoviedb.org/3/search/movie?api_key=${api_key}&query=${query}`);
    const data = await response.json();
    return data.results;
}

async function fetch_genre_func(genre_id) {
    const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${api_key}&with_genres=${genre_id}&sort_by=popularity.desc`);
    const data = await response.json();
    return data.results;
}

function suggestions_menu_show(movies) {
    suggestion_list.innerHTML = '';
    movies.forEach(movie => {
        const suggest_li = document.createElement('li');
        suggest_li.textContent = movie.title;
        suggest_li.onclick = () => {
            movie_descr_display(movie.id);
            suggestion_list.innerHTML = '';
            input_search.blur();
        };
        suggestion_list.appendChild(suggest_li);
    });
}

async function movie_descr_display(movie_id) {
    suggestion_list.innerHTML = '';
    const response = await fetch(`https://api.themoviedb.org/3/movie/${movie_id}?api_key=${api_key}&append_to_response=credits`);
    const movie = await response.json();

    movie_title.textContent = movie.title;
    movie_overview.textContent = movie.overview;
    movie_rating.textContent = movie.vote_average;
    movie_runtime.textContent = `${movie.runtime} minutes`;
    movie_poster.src = `https://image.tmdb.org/t/p/w500${movie.poster_path}`;

    movie_cast.innerHTML = '';
    movie.credits.cast.slice(0, 5).forEach(cast_member => {
        const cast_li = document.createElement('li');
        cast_li.textContent = cast_member.name;
        movie_cast.appendChild(cast_li);
    });

    movie_window.style.display = 'flex';

    add_to_watchlist_button.onclick = () => add_to_watchlist(movie);
}

close_window.onclick = () => {
    movie_window.style.display = 'none';
};

function add_to_watchlist(movie) {
    let watchlist_item = JSON.parse(localStorage.getItem('watchlist')) || [];
    if (!watchlist_item.some(item => item.id === movie.id)) {
        watchlist_item.push(movie);
        localStorage.setItem('watchlist', JSON.stringify(watchlist_item));
    }
    alert(`${movie.title} added to watchlist!`);
}

function display_watchlist() {
    const watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    watchlist_content.innerHTML = '';

    if (watchlist.length === 0) {
        watchlist_content.innerHTML = '<p> There is no films in your watchlist yet </p>';
    } else {
        watchlist.forEach(movie => {
            const watchlist_item = document.createElement('div');
            watchlist_item.classList.add('watchlist-item');
            watchlist_item.classList.add('black-movie');
            watchlist_item.innerHTML = `
                <span>${movie.title}</span>
                <button class="remove-btn" onclick="remove_from_watchlist(${movie.id})">Remove</button>
            `;
            watchlist_content.appendChild(watchlist_item);
        });
    }

}

function remove_from_watchlist(movie_id) {
    let watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
    watchlist = watchlist.filter(movie => movie.id !== movie_id);
    localStorage.setItem('watchlist', JSON.stringify(watchlist));
    display_watchlist();
}

function movies_show(movies) {
    movie_container.innerHTML = '';
    movies.forEach(movie => {
        const movie_card = document.createElement('div');
        movie_card.classList.add('movie-card');

        movie_card.innerHTML = `
        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
        <h3>${movie.title}</h3>
        <p>${movie.release_date}</p>
        `;

        movie_card.onclick = () => movie_descr_display(movie.id);
        movie_container.appendChild(movie_card);
    });
}

async function popular_movies() {
    const response = await fetch(`https://api.themoviedb.org/3/discover/movie?api_key=${api_key}&sort_by=popularity.desc`);
    const data = await response.json();
    movies_show(data.results);
}

popular_movies();
