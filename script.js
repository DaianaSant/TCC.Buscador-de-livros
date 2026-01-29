/* ========================= CHAVE DE API ========================= */
const GOOGLE_BOOKS_API_KEY = "AIzaSyCHPxfsAybkJZXSekc_iTBu0OQb9L8EVXA";

/* ========================= VARIÁVEIS GLOBAIS ========================= */
let lastApiResults = [];
let allKnownBooks = [];
let currentGenre = 'all';

/* ========================= MAPEAR GÊNEROS ========================= */
function mapGenre(apiGenre) {
  if (!apiGenre) return 'Geral';
  const lower = apiGenre.toLowerCase();

  if (lower.includes('fantasy') || lower.includes('fantasia')) return 'Fantasia';
  if (lower.includes('science fiction') || lower.includes('ficção científica') || lower.includes('sci-fi')) return 'Ficção Científica';
  if (lower.includes('dystopia') || lower.includes('distopia') || lower.includes('dystopian')) return 'Distopia';
  if (lower.includes('nonfiction') || lower.includes('não ficção') || lower.includes('biography') || lower.includes('history') || lower.includes('self-help')) return 'Não Ficção';
  if (lower.includes('fiction') || lower.includes('novel')) return 'Fantasia';
  return 'Geral';
}

/* ========================= FAVORITOS ========================= */
function toggleFavorite(bookId) {
  const user = localStorage.getItem("loggedUser");

  if (!user) {
    alert("Você precisa estar logado para favoritar livros.");
    return;
  }

  let favorites = getFavorites();
  const isFav = favorites.includes(bookId);

  if (isFav) {
    favorites = favorites.filter(id => id !== bookId);
    // (Opcional) aqui você pode criar um endpoint para remover do banco também
  } else {
    favorites.push(bookId);

    const book = allKnownBooks.find(b => b.id === bookId);
    if (!book) {
      console.error("Livro não encontrado na lista conhecida.");
      return;
    }

    // Enviar os dados para o PHP
    fetch("add_favorite.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user: user,
        book_id: book.id,
        title: book.title,
        author: book.author,
        cover: book.cover,
        genre: book.genre
      })
    })
    .then(res => {
      if (!res.ok) {
        throw new Error(`Erro do servidor: ${res.status}`);
      }
      return res.text();
    })
    .then(msg => {
      console.log("Resposta do servidor:", msg);
    })
    .catch(err => {
      console.error("Erro ao enviar favorito:", err);
      alert("Erro ao salvar favorito. Verifique sua conexão ou tente novamente.");
    });
  }

  saveFavorites(favorites);
  renderBooks(lastApiResults);
  renderFavorites();
}



/* ========================= HISTÓRICO ========================= */
function getHistory() {
  return JSON.parse(localStorage.getItem('searchHistory')) || [];
}

function saveHistory(history) {
  localStorage.setItem('searchHistory', JSON.stringify(history));
}

function addToHistory(term) {
  if (!term) return;
  let history = getHistory();
  history = history.filter(t => t !== term);
  history.unshift(term);
  if (history.length > 10) history.pop();
  saveHistory(history);
}

function renderHistory() {
  const history = getHistory();
  const list = document.getElementById('historyList');
  const emptyMsg = document.getElementById('emptyHistory');

  if (history.length === 0) {
    list.innerHTML = '';
    emptyMsg.style.display = 'block';
    return;
  }

  emptyMsg.style.display = 'none';
  list.innerHTML = '<ul>' + history.map(term => `<li><button onclick="searchFromHistory('${term.replace(/'/g, "\\'")}')">${term}</button></li>`).join('') + '</ul>';
}

/* Mensagem inicial */
function showInitialMessage() {
  const grid = document.getElementById('booksGrid');
  const history = getHistory();

  if (history.length === 0 && lastApiResults.length === 0) {
    grid.innerHTML = '<p class="empty-message">Comece pesquisando um livro!</p>';
  }
}


function searchFromHistory(term) {
  document.getElementById('searchInput').value = term;
  searchBooks();
  switchTab('all');
}

/* ========================= FILTRO POR GÊNERO ========================= */
function filterByGenre(genre) {
  currentGenre = genre;
  document.querySelectorAll('.genre-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.genre-btn').forEach(btn => {
    if (btn.getAttribute('onclick') === `filterByGenre('${genre}')`) {
      btn.classList.add('active');
    }
  });
  renderBooks(lastApiResults);
}

/* ========================= RENDERIZAÇÃO DE LIVROS ========================= */
function renderBooks(booksToRender) {
  let filtered = booksToRender;
  if (currentGenre !== 'all') {
    filtered = filtered.filter(book => mapGenre(book.genre) === currentGenre);
  }

  const grid = document.getElementById('booksGrid');
  grid.innerHTML = '';

  if (filtered.length === 0) {
    grid.innerHTML = `<p class="empty-message">Nenhum livro encontrado para o gênero "<strong>${currentGenre}</strong>".</p>`;
    return;
  }

  filtered.forEach(book => {
    const isFav = isFavorite(book.id);
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
      <img src="${book.cover}" alt="${book.title}">
      <div class="book-info">
        <h3 class="book-title"><a href="https://books.google.com/books?id=${book.id}" target="_blank">${book.title}</a></h3>
        <p class="book-author">${book.author}</p>
        <p class="status available">✓ Disponível</p>
        <button class="favorite-btn ${isFav ? 'favorited' : ''}" onclick="toggleFavorite('${book.id}')">
          ${isFav ? '❤️ Remover dos favoritos' : '🤍 Adicionar aos favoritos'}
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

function renderFavorites() {
  const favorites = getFavorites();
  const favoriteBooks = allKnownBooks.filter(book => favorites.includes(book.id));
  const grid = document.getElementById('favoritesGrid');
  const emptyMsg = document.getElementById('emptyFavorites');

  if (favoriteBooks.length === 0) {
    grid.innerHTML = '';
    emptyMsg.style.display = 'block';
    return;
  }

  emptyMsg.style.display = 'none';
  grid.innerHTML = '';

  favoriteBooks.forEach(book => {
    const card = document.createElement('div');
    card.className = 'book-card';
    card.innerHTML = `
      <img src="${book.cover}" alt="${book.title}">
      <div class="book-info">
        <h3 class="book-title"><a href="https://books.google.com/books?id=${book.id}" target="_blank">${book.title}</a></h3>
        <p class="book-author">${book.author}</p>
        <p class="status available">✓ Disponível</p>
        <button class="favorite-btn favorited" onclick="toggleFavorite('${book.id}')">
          ❌ Remover dos favoritos
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* ========================= ABAS ========================= */
function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));

  document.getElementById(tabName + '-tab').classList.add('active');
  document.querySelector(`.tab-button[onclick="switchTab('${tabName}')"]`).classList.add('active');

  if (tabName === 'favorites') renderFavorites();
  if (tabName === 'history') renderHistory();
}

/* ========================= BUSCA NA API ========================= */
async function searchBooks() {
  const term = document.getElementById('searchInput').value.trim();
  const grid = document.getElementById('booksGrid');
  grid.innerHTML = '<p class="empty-message">Buscando livros...</p>';

  if (!term) {
  grid.innerHTML = '<p class="empty-message">Comece pesquisando um livro!</p>';
  lastApiResults = [];
  renderBooks([]);
  return;
}

  addToHistory(term);

  try {
    const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(term)}&maxResults=20&key=${GOOGLE_BOOKS_API_KEY}`);
    if (!response.ok) throw new Error(`Erro HTTP! Status: ${response.status}`);

    const data = await response.json();
    const apiBooks = (data.items || []).map(item => ({
      id: item.id,
      title: item.volumeInfo.title || 'Título Desconhecido',
      author: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Autor Desconhecido',
      cover: item.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x190?text=Sem+Capa',
      status: 'available',
      genre: item.volumeInfo.categories ? item.volumeInfo.categories[0] : null
    }));

    lastApiResults = apiBooks;
    apiBooks.forEach(book => {
      if (!allKnownBooks.some(b => b.id === book.id)) allKnownBooks.push(book);
    });

    renderBooks(lastApiResults);
    filterByGenre(currentGenre);

  } catch (error) {
    console.error("Erro ao buscar livros:", error);
    grid.innerHTML = '<p class="empty-message">Ocorreu um erro ao buscar os livros. Tente novamente mais tarde.</p>';
  }
}
/* ========================= LOGIN & CADASTRO ========================= */
function toggleLoginModal() {
  const modal = document.getElementById("loginModal");
  modal.style.display = modal.style.display === "block" ? "none" : "block";
}

/* Fechar modal clicando fora */
window.onclick = function(event) {
  const modal = document.getElementById("loginModal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

/* Exibir usuário logado no header (PHP define via sessão) */
document.addEventListener('DOMContentLoaded', () => {
  updateFavoriteCount();
  renderHistory();

  // Ativa botões padrão
  document.querySelector('.genre-btn[onclick="filterByGenre(\'all\')"]').classList.add('active');
  document.querySelector('.tab-button[onclick="switchTab(\'all\')"]').classList.add('active');

  // Se PHP já definiu usuário logado, pega via elemento oculto
  const loggedUser = document.getElementById("loggedUser")?.textContent;
  if (loggedUser) {
    const header = document.querySelector("header");
    let userDisplay = document.getElementById("userDisplay");
    if (!userDisplay) {
      userDisplay = document.createElement("div");
      userDisplay.id = "userDisplay";
      userDisplay.style.position = "absolute";
      userDisplay.style.top = "20px";
      userDisplay.style.right = "70px";
      userDisplay.style.color = "white";
      header.appendChild(userDisplay);
    }
    userDisplay.textContent = `👤 ${loggedUser}`;
  }
});


/* Login de usuário */
document.getElementById("loginForm").addEventListener("submit", e => {
  e.preventDefault();
  const user = document.getElementById("loginUser").value.trim();
  const pass = document.getElementById("loginPass").value.trim();

  let users = JSON.parse(localStorage.getItem("users")) || [];
  const found = users.find(u => u.user === user && u.pass === pass);

  if (found) {
    alert(`Bem-vindo, ${user}!`);
    localStorage.setItem("loggedUser", user);
    toggleLoginModal();

    // Exibir usuário logado no header
    const header = document.querySelector("header");
    let userDisplay = document.getElementById("userDisplay");
    if (!userDisplay) {
      userDisplay = document.createElement("div");
      userDisplay.id = "userDisplay";
      userDisplay.style.position = "absolute";
      userDisplay.style.top = "20px";
      userDisplay.style.right = "70px";
      userDisplay.style.color = "white";
      header.appendChild(userDisplay);
    }
    userDisplay.textContent = `👤 ${user}`;
  } else {
    alert("Usuário ou senha incorretos!");
  }
});

/* ========================= INICIALIZAÇÃO ========================= */
document.addEventListener('DOMContentLoaded', () => {
  updateFavoriteCount();
  renderHistory();

  // Ativa botões padrão
  document.querySelector('.genre-btn[onclick="filterByGenre(\'all\')"]').classList.add('active');
  document.querySelector('.tab-button[onclick="switchTab(\'all\')"]').classList.add('active');

  // Exibe mensagem inicial
  showInitialMessage();

  // Se já houver usuário logado, mostra no header
  const loggedUser = localStorage.getItem("loggedUser");
  if (loggedUser) {
    const header = document.querySelector("header");
    let userDisplay = document.getElementById("userDisplay");
    if (!userDisplay) {
      userDisplay = document.createElement("div");
      userDisplay.id = "userDisplay";
      userDisplay.style.position = "absolute";
      userDisplay.style.top = "20px";
      userDisplay.style.right = "70px";
      userDisplay.style.color = "white";
      header.appendChild(userDisplay);
    }
    userDisplay.textContent = `👤 ${loggedUser}`;
  }
});


/* Busca com Enter */
document.getElementById('searchInput').addEventListener('keypress', e => {
  if (e.key === 'Enter') searchBooks();
});

/* Sugestões de histórico */
document.getElementById('searchInput').addEventListener('input', showSuggestions);

function showSuggestions() {
  const input = document.getElementById('searchInput');
  const suggestionsDiv = document.getElementById('suggestions');
  const query = input.value.trim().toLowerCase();

  if (!query) {
    suggestionsDiv.style.display = 'none';
    return;
  }

  const history = getHistory();
  const matches = history.filter(term => term.toLowerCase().includes(query));

  if (matches.length === 0) {
    suggestionsDiv.style.display = 'none';
    return;
  }

  suggestionsDiv.innerHTML = '<ul>' + matches.map(term => `<li onclick="selectSuggestion('${term.replace(/'/g, "\\'")}')">${term}</li>`).join('') + '</ul>';
  suggestionsDiv.style.display = 'block';
}

function selectSuggestion(term) {
  document.getElementById('searchInput').value = term;
  document.getElementById('suggestions').style.display = 'none';
  searchBooks();
}
/* Fechar sugestões ao clicar fora */
window.addEventListener('click', function(event) {
  const suggestionsDiv = document.getElementById('suggestions');  
  const input = document.getElementById('searchInput');
  if (event.target !== suggestionsDiv && event.target !== input) {
    suggestionsDiv.style.display = 'none';
  }
});
