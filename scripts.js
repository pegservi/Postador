const correctHash = "b48a4a0eb759b7aa1b3bfcba2e863f0cdda1bb67dbfe5ff6c8812dc644b0825b"; // Replace with your SHA-256 hash

        function sha256(message) {
            return CryptoJS.SHA256(message).toString(CryptoJS.enc.Hex);
        }

        function showErrorMessage() {
            const errorMessage = document.getElementById("errorMessage");
            errorMessage.classList.add("show");

            setTimeout(() => {
                errorMessage.classList.remove("show");
            }, 2000);
        }

        function checkPassword() {
            const password = document.getElementById("password").value;
            const hashedPassword = sha256(password);

            if (hashedPassword === correctHash) {
                document.getElementById("loginDialog").style.display = "none";
                document.body.style.overflow = "auto";
            } else {
                showErrorMessage();
            }
        }



document.addEventListener('DOMContentLoaded', function() {
    const yearFilter = document.getElementById("yearFilter");
    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year >= 1900; year--) {
        const option = document.createElement("option");
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
    }

    let page = 1;
    let loading = false;

    document.getElementById("discoverButton").addEventListener("click", function() {
        page = 1; // Reset to the first page on new discover
        const genreId = document.getElementById("genreFilter").value;
        const year = document.getElementById("yearFilter").value;
        discoverMovies(genreId, year, page);
    });

    window.addEventListener('scroll', function() {
        if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight && !loading) {
            page++;
            const genreId = document.getElementById("genreFilter").value;
            const year = document.getElementById("yearFilter").value;
            discoverMovies(genreId, year, page);
        }
    });

    function discoverMovies(genreId, year, page) {
        const loadingSpinner = document.getElementById("loadingSpinner");
        loadingSpinner.style.display = 'block';
        loading = true;
        let apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=8cde2d10bf15eb193eda5236cbee0438&page=${page}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false`;
        if (genreId) {
            apiUrl += '&with_genres=' + genreId;
        }
        if (year) {
            apiUrl += '&primary_release_year=' + year;
        }

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                setTimeout(() => {
                    const movieGrid = document.getElementById("movieGrid");
                    if (page === 1) {
                        movieGrid.innerHTML = ''; // Clear previous movies if starting fresh
                    }

                    data.results.forEach(movie => {
                        const movieCard = document.createElement("div");
                        movieCard.classList.add("movie-card");
                        movieCard.innerHTML = `
                            <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                            <h3>${movie.title}</h3>
                            <div class="movie-info">
                                <div class="rating">
                                    <img src="https://upload.wikimedia.org/wikipedia/commons/1/18/Five-pointed_star.svg" alt="Star">
                                    <span>${movie.vote_average.toFixed(1)}</span>
                                </div>
                                <span>${new Date(movie.release_date).getFullYear()}</span>
                            </div>
                        `;
                        movieGrid.appendChild(movieCard);
                    });

                    loadingSpinner.style.display = 'none';
                    loading = false;
                }, 2000); // 2 seconds delay
            })
            .catch(error => {
                console.error('Error fetching movies:', error);
                loadingSpinner.style.display = 'none';
                loading = false;
            });
    }

    document.getElementById("searchButton").addEventListener("click", function() {
        const searchInput = document.getElementById("searchInput").value.trim();
        if (searchInput !== "") {
            searchMovies(searchInput);
        }
    });

    function searchMovies(query) {
        const loadingSpinner = document.getElementById("loadingSpinner");
        loadingSpinner.style.display = 'block';
        loading = true;
        const apiUrl = `https://api.themoviedb.org/3/search/movie?api_key=8cde2d10bf15eb193eda5236cbee0438&query=${query}&language=en-US&page=1&include_adult=false`;

        fetch(apiUrl)
            .then(response => response.json())
            .then(data => {
                const movieGrid = document.getElementById("movieGrid");
                movieGrid.innerHTML = ''; // Clear previous movies

                data.results.forEach(movie => {
                    const movieCard = document.createElement("div");
                    movieCard.classList.add("movie-card");
                    movieCard.innerHTML = `
                        <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" alt="${movie.title}">
                        <h3>${movie.title}</h3>
                        <div class="movie-info">
                            <div class="rating">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/1/18/Five-pointed_star.svg" alt="Star">
                                <span>${movie.vote_average.toFixed(1)}</span>
                            </div>
                            <span>${new Date(movie.release_date).getFullYear()}</span>
                        </div>
                    `;
                    movieGrid.appendChild(movieCard);
                });

                loadingSpinner.style.display = 'none';
                loading = false;
            })
            .catch(error => {
                console.error('Error searching movies:', error);
                loadingSpinner.style.display = 'none';
                loading = false;
            });
    }

    const dialog = document.getElementById('dialog');
    const publishButton = document.getElementById('publishButton');
    const cancelButton = document.getElementById('cancelButton');
    const progressBar = document.getElementById('progressBar');
    const publishStatus = document.getElementById('publishStatus');

    document.getElementById('movieGrid').addEventListener('click', function(event) {
        if (event.target.tagName === 'IMG') {
            dialog.style.display = 'flex';
            const movieCard = event.target.closest('.movie-card');
            const movieTitle = movieCard.querySelector('h3').textContent;
            const moviePoster = movieCard.querySelector('img').src;
            const movieRating = movieCard.querySelector('.rating span').textContent;
            const movieYear = movieCard.querySelector('.movie-info span').textContent;

            publishButton.onclick = function() {
                publishToBlogger(movieTitle, moviePoster, movieRating, movieYear);
            };
        }
    });

    cancelButton.addEventListener('click', function() {
        dialog.style.display = 'none';
    });

    function publishToBlogger(title, poster, rating, year) {
        const movieDetails = getMovieDetails(title);

        movieDetails.then(movie => {
            const content = `
<!-- Post type -->
<b class='none the-entry-rate'>${movie.vote_average.toFixed(1)}</b>
<b class='none the-entry-type'>${new Date(movie.release_date).getFullYear()}</b>
<img style="display: none; width: 0" src="https://image.tmdb.org/t/p/w500${movie.poster_path}"/>             
                    
<div class="the-best-player">
<div class="player-bg" style="background: url('https://image.tmdb.org/t/p/w1280${movie.backdrop_path}') no-repeat center center / cover;"></div>
<div class="max-width-header">
<div class="header-title-info">
<h1 class="header-title-info_tit">${movie.title}</h1>
<p class="header-title-info_sub"></p>
</div>
<div class="header-actions">
<a href="#allEpList" class="back-episode-list">
<span class="material-symbols-outlined"> format_list_bulleted </span>
<p>Go Back</p>
</a>
</div>
</div>

<div class="options_grid" id="optionsGrid">
<div class="option-btn option-btn-active" data-link="https://superflixapi.dev/filme/${movie.imdb_id}">OPÇÃO 1</div>
<div class="option-btn" data-link="https://superflixapi.dev/filme/${movie.imdb_id}">OPÇÃO 2</div>
<div class="option-btn" data-link="https://embed.embedplayer.site/${movie.imdb_id}">OPÇÃO 3</div>
<div class="option-btn" data-link="https://www.youtube.com/embed/${movie.trailerId}">Trailer</div>
</div>

<div class="iframe-container">
<iframe src="" class="" frameborder="0" allowfullscreen="" ></iframe>
</div>
</div>

<div class="swiper-slide">
<div class="big_slider_item">
<div class="big_slider_item--bg" style="background: url('https://image.tmdb.org/t/p/w1280${movie.backdrop_path}') no-repeat center top / cover;"></div>
<div class="big_slider_item--info max-width">
<h1 class="bs-title">${movie.title}</h1>

<ul class="big_slider_item--info_tags">
<li>${new Date(movie.release_date).getFullYear()}</li>
<li>${movie.runtime} Minutes</li>
</ul>
<ul class="big_slider_item--info_category">
<li>${movie.genres.map(genre => genre.name).join(', ')}</li>
</ul>

<ul class="big_slider_item--info_rating">
<li class="big_slider_item--info_rating-stars">
<i class="fa-solid fa-star"></i>
<i class="fa-solid fa-star"></i>
<i class="fa-solid fa-star"></i>
<i class="fa-solid fa-star"></i>
<i class="fa-solid fa-star"></i>
<!-- <i class="fa-solid fa-star-half-stroke"></i> -->
</li>
<li class="big_slider_item--info__rate-numbers">
${movie.vote_average.toFixed(1)} <i class="fa-solid fa-star"></i>
</li>
<span></span>
</ul>

<p class="big_slider_item--info_resume">${movie.overview}</p>


<!-- <h1 class="big_slider_item--info_opt-text">¡New Season!</h1> -->

<ul class="big_slider_item--info_buttons">
<li>
<a href="#!" class="btn-play">
<span class="material-symbols-rounded">    
play_arrow
</span>
</a>
</li>

<li>
<button class="btn fav-btn" fav-id="${movie.vote_average.toFixed(1)}">
<span class="material-symbols-rounded">
playlist_add
</span>
Add to my list
</button>
<div class="blogger-entry-data" style="display: none;" entry-type="${movie.genres.map(genre => genre.name).join(', ')}" entry-bg="https://image.tmdb.org/t/p/w500${movie.poster_path}" entry-title="${movie.title}"></div>

</li>
</ul>

</div>
</div>
</div>
            `;

            const blogId = "1300435587470765271";
            const clientId = "264213259525-rkqb3r26h4k5hotmn4958oelg03t0i1v.apps.googleusercontent.com";
            const clientSecret = "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";
            const refreshToken = "1//04WFgcc1K4GfaCgYIARAAGAQSNwF-L9IrurnWjAGNr7LGCms3TRZJB64Nfur47l-7HQ1EWcy80ibGgc_RYBCuHxC3KEEHn4EdVrI";

            progressBar.style.width = '0%';
            progressBar.style.display = 'block';
            publishStatus.textContent = '';

            getAccessToken(clientId, clientSecret, refreshToken).then(accessToken => {
                const interval = setInterval(() => {
                    let width = parseInt(progressBar.style.width);
                    if (width >= 100) {
                        clearInterval(interval);
                    } else {
                        width++;
                        progressBar.style.width = width + '%';
                    }
                }, 30);

                fetch(`https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        kind: "blogger#post",
                        blog: {
                            id: blogId
                        },
                        title: title,
                        content: content,
                        labels: [`${new Date(movie.release_date).getFullYear()}`, `${movie.genres.map(genre => genre.name).join(', ')}`, `Filmes`] 
                    })
                })
                .then(response => response.json())
                .then(data => {
                    clearInterval(interval);
                    progressBar.style.width = '100%';
                    publishStatus.textContent = 'Publicado com sucesso!';
                    setTimeout(() => {
                        dialog.style.display = 'none';
                    }, 2000);
                })
                .catch(error => {
                    console.error('Error publishing post:', error);
                    clearInterval(interval);
                    publishStatus.textContent = 'Erro ao publicar.';
                });
            });
        });
    }

    function getAccessToken(clientId, clientSecret, refreshToken) {
        return fetch('https://accounts.google.com/o/oauth2/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `client_id=${clientId}&client_secret=${clientSecret}&refresh_token=${refreshToken}&grant_type=refresh_token`
        })
        .then(response => response.json())
        .then(data => data.access_token)
        .catch(error => {
            console.error('Error getting access token:', error);
        });
    }

    function getMovieDetails(title) {
        return fetch(`https://api.themoviedb.org/3/search/movie?api_key=8cde2d10bf15eb193eda5236cbee0438&query=${encodeURIComponent(title)}`)
            .then(response => response.json())
            .then(data => {
                const movie = data.results[0];
                return fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=8cde2d10bf15eb193eda5236cbee0438&append_to_response=videos`)
                    .then(response => response.json())
                    .then(details => {
                        const trailer = details.videos.results.find(video => video.type === 'Trailer' && video.site === 'YouTube');
                        return {
                            ...details,
                            trailerId: trailer ? trailer.key : null
                        };
                    });
            });
    }
});
document.getElementById('movieGrid').addEventListener('click', function(event) {
    if (event.target.tagName === 'IMG') {
        const dialog = document.getElementById('dialog');
        const dialogTitle = document.getElementById('dialogTitle');
        dialog.style.display = 'flex';

        const movieCard = event.target.closest('.movie-card');
        const movieTitle = movieCard.querySelector('h3').textContent;

        // Define o título do diálogo
        dialogTitle.textContent = movieTitle;

        // Configura o botão de publicar
        const publishButton = document.getElementById('publishButton');
        publishButton.onclick = function() {
            publishToBlogger(movieTitle);
        };
    }
});
document.addEventListener('DOMContentLoaded', function() {
    const publishedMovies = []; // Array para armazenar os filmes publicados

    // Função para abrir um diálogo
    function openDialog(dialogId) {
        document.getElementById(dialogId).style.display = 'flex';
    }

    // Função para fechar um diálogo
    function closeDialog(dialogId) {
        document.getElementById(dialogId).style.display = 'none';
    }

    // Evento para abrir o diálogo de filmes publicados ao clicar no botão
    document.getElementById('postedButton').addEventListener('click', function() {
        displayPublishedMovies(); // Atualiza a lista de filmes publicados
        openDialog('postedDialog');
    });

    // Evento para fechar o diálogo de filmes publicados
    document.getElementById('closePostedDialog').addEventListener('click', function() {
        closeDialog('postedDialog');
    });

    // Função para exibir os filmes publicados no diálogo
    function displayPublishedMovies() {
        const postedMoviesList = document.getElementById('postedMoviesList');
        postedMoviesList.innerHTML = ''; // Limpa a lista antes de carregar

        if (publishedMovies.length === 0) {
            postedMoviesList.textContent = 'Nenhum filme publicado.';
        } else {
            publishedMovies.forEach((movie, index) => {
                const movieItem = document.createElement('div');
                movieItem.classList.add('movie-item');
                movieItem.textContent = movie.title; // Exibe apenas o título do filme
                
                // Cria botão de edição
                const editButton = document.createElement('button');
                editButton.classList.add('icon-button', 'edit-button');
                editButton.innerHTML = '✏️'; // Ícone de lápis
                editButton.addEventListener('click', () => openEditDialog(index));
                
                // Cria botão de exclusão
                const deleteButton = document.createElement('button');
                deleteButton.classList.add('icon-button', 'delete-button');
                deleteButton.innerHTML = '🗑️'; // Ícone de lixeira
                deleteButton.addEventListener('click', () => deleteMovie(index));

                // Adiciona botões à lista de filmes
                movieItem.appendChild(editButton);
                movieItem.appendChild(deleteButton);
                postedMoviesList.appendChild(movieItem);
            });
        }
    }

    // Função para abrir o diálogo de edição de filme
    function openEditDialog(index) {
        const movie = publishedMovies[index];
        document.getElementById('titleInput').value = movie.title;
        document.getElementById('imageInput').value = movie.poster; // Adicione o campo de imagem se necessário
        document.getElementById('synopsisInput').value = movie.synopsis; // Adicione o campo de sinopse se necessário
        openDialog('editDialog');

        // Adiciona evento ao botão de salvar edição
        document.getElementById('saveEditButton').onclick = function() {
            saveEdit(index);
        };

        // Adiciona evento ao botão de cancelar edição
        document.getElementById('cancelEditButton').onclick = function() {
            closeDialog('editDialog');
        };
    }

    // Função para salvar edição do filme
    function saveEdit(index) {
        const newTitle = document.getElementById('titleInput').value.trim();
        const newImage = document.getElementById('imageInput').value.trim(); // Adicione se necessário
        const newSynopsis = document.getElementById('synopsisInput').value.trim(); // Adicione se necessário

        if (newTitle) {
            publishedMovies[index].title = newTitle;
            publishedMovies[index].poster = newImage; // Atualize o campo de imagem se necessário
            publishedMovies[index].synopsis = newSynopsis; // Atualize o campo de sinopse se necessário
            closeDialog('editDialog');
            displayPublishedMovies(); // Atualiza a lista após a edição
        } else {
            alert('O título não pode estar vazio.');
        }
    }

    // Função para deletar filme
    function deleteMovie(index) {
        if (confirm('Tem certeza que deseja deletar este filme?')) {
            publishedMovies.splice(index, 1); // Remove o filme do array
            displayPublishedMovies(); // Atualiza a lista após a exclusão
        }
    }

    // Modifica a lógica de publicação para adicionar filmes publicados ao array
    function publishToBlogger(title, poster, rating, year) {
        const content = `
            <h2>${title}</h2>
            <img src="${poster}" alt="${title}">
            <p><strong>Rating:</strong> ${rating}</p>
            <p><strong>Year:</strong> ${year}</p>
        `;

        const blogId = "1300435587470765271";
            const clientId = "264213259525-rkqb3r26h4k5hotmn4958oelg03t0i1v.apps.googleusercontent.com";
            const clientSecret = "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";
            const refreshToken = "1//04WFgcc1K4GfaCgYIARAAGAQSNwF-L9IrurnWjAGNr7LGCms3TRZJB64Nfur47l-7HQ1EWcy80ibGgc_RYBCuHxC3KEEHn4EdVrI";

        progressBar.style.width = '0%';
        progressBar.style.display = 'block';
        publishStatus.textContent = '';

        getAccessToken(clientId, clientSecret, refreshToken).then(accessToken => {
            const interval = setInterval(() => {
                let width = parseInt(progressBar.style.width);
                if (width >= 100) {
                    clearInterval(interval);
                } else {
                    width++;
                    progressBar.style.width = width + '%';
                }
            }, 30);

            fetch(`https://www.googleapis.com/blogger/v3/blogs/${blogId}/posts/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    kind: 'blogger#post',
                    blog: {
                        id: blogId
                    },
                    title: title,
                    content: content,
                    labels: [year] // Adiciona o ano como etiqueta
                })
            })
            .then(response => response.json())
            .then(data => {
                console.log('Post published:', data);
                publishedMovies.push({ title, poster, synopsis: '' }); // Adicione o campo de sinopse se necessário
                clearInterval(interval);
                progressBar.style.display = 'none';
                publishStatus.textContent = 'Publicado com sucesso!';
                setTimeout(() => {
                    dialog.style.display = 'none';
                    publishStatus.textContent = '';
                }, 5000);
            })
            .catch(error => {
                console.error('Error publishing post:', error);
                clearInterval(interval);
                progressBar.style.display = 'none';
                publishStatus.textContent = 'Erro ao publicar.';
            });
        });
    }

    function getAccessToken(clientId, clientSecret, refreshToken) {
        return fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                refresh_token: refreshToken,
                grant_type: 'refresh_token'
            })
        })
        .then(response => response.json())
        .then(data => data.access_token)
        .catch(error => {
            console.error('Error fetching access token:', error);
            throw new Error('Error fetching access token');
        });
    }
});
function showLoadingSpinner() {
    document.getElementById('loadingSpinner').classList.add('active');
}

function hideLoadingSpinner() {
    document.getElementById('loadingSpinner').classList.remove('active');
}
