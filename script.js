document.addEventListener("DOMContentLoaded", function() {
    const signupForm = document.getElementById("signup-form");
    const loginForm = document.getElementById("login-form");
    const otpForm = document.getElementById("otp-form");
    const otpInput = document.getElementById("otp-input");

    const moviesSection = document.getElementById("movies-content");
    const tvSeriesSection = document.getElementById("tv-series-content");
    const sportsSection = document.getElementById("sports-content");
    const newsSection = document.getElementById("news-content");
    const animeSection = document.getElementById("anime-content");
    const kidsSection = document.getElementById("kids-content");

    const TMDB_API_KEY = 'YOUR_TMDB_API_KEY';
    const NEWS_API_KEY = 'YOUR_NEWS_API_KEY';
    const SPORTS_DB_API_KEY = 'YOUR_SPORTS_DB_API_KEY';
    const JIKAN_API_URL = 'https://api.jikan.moe/v3';
    const GIPHY_API_KEY = 'YOUR_GIPHY_API_KEY';

    // Fetch and display movies
    fetch(`https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}`)
        .then(response => response.json())
        .then(data => {
            const movies = data.results;
            movies.forEach(movie => {
                const movieElement = document.createElement('div');
                movieElement.textContent = movie.title;
                moviesSection.appendChild(movieElement);
            });
        });

    // Fetch and display TV series
    fetch(`https://api.themoviedb.org/3/tv/popular?api_key=${TMDB_API_KEY}`)
        .then(response => response.json())
        .then(data => {
            const tvSeries = data.results;
            tvSeries.forEach(tv => {
                const tvElement = document.createElement('div');
                tvElement.textContent = tv.name;
                tvSeriesSection.appendChild(tvElement);
            });
        });

    // Fetch and display sports
    fetch(`https://www.thesportsdb.com/api/v1/json/${SPORTS_DB_API_KEY}/search_all_leagues.php?s=Soccer`)
        .then(response => response.json())
        .then(data => {
            const sports = data.countrys;
            sports.forEach(sport => {
                const sportElement = document.createElement('div');
                sportElement.textContent = sport.strLeague;
                sportsSection.appendChild(sportElement);
            });
        });

    // Fetch and display news
    fetch(`https://newsapi.org/v2/top-headlines?country=us&apiKey=${NEWS_API_KEY}`)
        .then(response => response.json())
        .then(data => {
            const articles = data.articles;
            articles.forEach(article => {
                const articleElement = document.createElement('div');
                articleElement.textContent = article.title;
                newsSection.appendChild(articleElement);
            });
        });

    // Fetch and display anime
    fetch(`${JIKAN_API_URL}/top/anime/1/airing`)
        .then(response => response.json())
        .then(data => {
            const animeList = data.top;
            animeList.forEach(anime => {
                const animeElement = document.createElement('div');
                animeElement.textContent = anime.title;
                animeSection.appendChild(animeElement);
            });
        });

    // Fetch and display kids content
    fetch(`https://api.giphy.com/v1/gifs/search?api_key=${GIPHY_API_KEY}&q=cartoon&limit=10&rating=g`)
        .then(response => response.json())
        .then(data => {
            const gifs = data.data;
            gifs.forEach(gif => {
                const gifElement = document.createElement('img');
                gifElement.src = gif.images.fixed_height.url;
                kidsSection.appendChild(gifElement);
            });
        });

    // Signup form submission
    if (signupForm) {
        signupForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const newUser = {
                firstName: document.getElementById("first-name").value.trim(),
                lastName: document.getElementById("last-name").value.trim(),
                username: document.getElementById("username").value.trim(),
                email: document.getElementById("email").value.trim(),
                password: document.getElementById("password").value.trim(),
                dob: document.getElementById("dob").value,
                contact: document.getElementById("contact").value.trim(),
                profilePicture: document.getElementById("profile-picture").files[0]
            };

            fetch("/api/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newUser),
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                window.location.href = "login.html";
            })
            .catch((error) => {
                console.error("Error:", error);
            });
        });
    }

    // Login form submission
    if (loginForm) {
        loginForm.addEventListener("submit", function(event) {
            event.preventDefault();

            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value.trim();
            const captchaResponse = grecaptcha.getResponse();

            fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password, captchaResponse }),
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const otp = data.otp;
                    alert(`OTP sent to registered contact: ${otp}`);
                    otpForm.style.display = "block";
                    loginForm.style.display = "none";
                } else {
                    alert("Login failed: " + data.message);
                }
            })
            .catch((error) => {
                console.error("Error:", error);
            });
        });
    }

    // OTP form submission
    if (otpForm) {
        otpForm.addEventListener("submit", function(event) {
            event.preventDefault();
            const enteredOTP = parseInt(otpInput.value.trim(), 10);

            fetch("/api/verify-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ otp: enteredOTP }),
            })
            .then((response) => response.json())
            .then((data) => {
                if (data.success) {
                    alert("OTP verified. You are logged in!");
                    window.location.href = "index.html"; // Redirect to home page
                } else {
                    alert("Invalid OTP. Please try again.");
                    otpInput.value = ""; // Clear OTP input
                }
            })
            .catch((error) => {
                console.error("Error:", error);
            });
        });
    }
});
