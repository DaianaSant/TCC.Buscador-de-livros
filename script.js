
    // Adicione chave de API 
    const GOOGLE_BOOKS_API_KEY = "AIzaSyCHPxfsAybkJZXSekc_iTBu0OQb9L8EVXA"; // Nossa chave APi

    // Variável para armazenar os últimos resultados da API
    let lastApiResults = [];
    let currentGenre = 'all';

    // Carregar favoritos do localStorage
    function getFavorites() {
      return JSON.parse(localStorage.getItem('favorites')) || [];
    }

    // Salvar favoritos no localStorage
    function saveFavorites(favorites) {
      localStorage.setItem('favorites', JSON.stringify(favorites));
      updateFavoriteCount();
    }

    // Verificar se um livro está nos favoritos
    function isFavorite(bookId) {
      return getFavorites().includes(bookId);
    }

    // Adicionar/remover favorito
    function toggleFavorite(bookId) {
      let favorites = getFavorites();
      if (favorites.includes(bookId)) {
        favorites = favorites.filter(id => id !== bookId);
      } else {
        favorites.push(bookId);
      }
      saveFavorites(favorites);
      
      // Re-renderiza a grade principal para atualizar o estado do botão de favorito
      renderBooks(lastApiResults); 
      renderFavorites(); // Re-renderiza a grade de favoritos
    }

    // Atualizar contador de favoritos
    function updateFavoriteCount() {
      const count = getFavorites().length;
      document.getElementById('favCount').textContent = count > 0 ? `(${count})` : '';
    }

    // Carregar histórico do localStorage
    function getHistory() {
      return JSON.parse(localStorage.getItem('searchHistory')) || [];
    }

    // Salvar histórico no localStorage
    function saveHistory(history) {
      localStorage.setItem('searchHistory', JSON.stringify(history));
    }

    // Adicionar termo ao histórico
    function addToHistory(term) {
      let history = getHistory();
      if (!history.includes(term)) {
        history.unshift(term); // Add to beginning
        if (history.length > 10) history = history.slice(0, 10); // Limit to 10
        saveHistory(history);
      }
    }

    // Renderizar histórico
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

    // Função para buscar a partir do histórico
    function searchFromHistory(term) {
      document.getElementById('searchInput').value = term;
      searchBooks();
      // Switch to all tab
      switchTab('all');
    }

    // Função para filtrar por gênero (não está funcionando)
    function filterByGenre(genre) {
      currentGenre = genre;
      document.querySelectorAll('.genre-btn').forEach(btn => btn.classList.remove('active'));
      
      // Garante que o botão clicado (ou o 'Todos' inicial) seja ativado
      const clickedButton = event ? event.target : document.querySelector(`.genre-btn[onclick="filterByGenre('${genre}')"]`);
      if (clickedButton) {
        clickedButton.classList.add('active');
      }
      renderBooks(lastApiResults); // Renderiza os últimos resultados da API com o novo filtro de gênero
    }

    // Função para renderizar os livros na grade principal
    function renderBooks(booksToRender) {
      let filtered = booksToRender;
      if (currentGenre !== 'all') {
        filtered = filtered.filter(book => book.genre === currentGenre);
      }
      const grid = document.getElementById('booksGrid');
      grid.innerHTML = '';

      if (filtered.length === 0) {
        grid.innerHTML = '<p class="empty-message">Nenhum livro encontrado para sua busca ou filtro.</p>';
        return;
      }

      filtered.forEach(book => {
        const card = document.createElement('div');
        card.className = 'book-card';
        const isFav = isFavorite(book.id);
        card.innerHTML = `
          <img src="${book.cover}" alt="${book.title}">
          <div class="book-info">
            <h3 class="book-title"><a href="https://books.google.com/books?id=${book.id}" target="_blank">${book.title}</a></h3>
            <p class="book-author">${book.author}</p>
            <p class="status ${book.status}">
              ${book.status === 'available' ? '✓ Disponível' : 'Emprestado'}
            </p>
            <button class="favorite-btn ${isFav ? 'favorited' : ''}" onclick="toggleFavorite('${book.id}')">
              ${isFav ? '❤️ Favorito' : '🤍 Adicionar aos favoritos'}
            </button>
          </div>
        `;
        grid.appendChild(card);
      });
    }

    // Função para renderizar os livros favoritos
    function renderFavorites() {
      const favorites = getFavorites();
      // Para exibir os favoritos, precisamos buscar os detalhes desses livros.
      // Uma abordagem simples é ter um array global de todos os livros já vistos
      // ou fazer uma nova chamada à API para cada ID de favorito (menos eficiente).
      // Para este exemplo, vamos assumir que 'lastApiResults' contém os livros que podem ser favoritos.
      // Em um sistema real, você teria um array 'allKnownBooks' ou faria chamadas específicas.
      const allKnownBooks = [...lastApiResults]; // Poderia ser um array mais abrangente
      
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
            <p class="status ${book.status}">
              ${book.status === 'available' ? '✓ Disponível' : 'Emprestado'}
            </p>
            <button class="favorite-btn favorited" onclick="toggleFavorite('${book.id}')">
             ❌ Remover dos favoritos
            </button>
          </div>
        `;
        grid.appendChild(card);
      });
    }

    // Função para alternar entre as abas
    function switchTab(tabName) {
      document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
      });
      document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
      });

      document.getElementById(tabName + '-tab').classList.add('active');
      event.target.classList.add('active');

      if (tabName === 'favorites') {
        renderFavorites(); // Garante que os favoritos sejam atualizados ao mudar para a aba
      } else if (tabName === 'history') {
        renderHistory();
      }
    }

    // Função principal para buscar livros na API do Google Books
    async function searchBooks() {
      const term = document.getElementById('searchInput').value.trim();
      const grid = document.getElementById('booksGrid');
      grid.innerHTML = '<p class="empty-message">Buscando livros...</p>'; // Mensagem de carregamento

      if (!term) {
        grid.innerHTML = '<p class="empty-message">Digite um termo para buscar livros.</p>';
        lastApiResults = []; // Limpa os resultados anteriores
        renderBooks([]); // Limpa a exibição
        return;
      }

      addToHistory(term);

      try {
        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${term}&maxResults=20&key=${GOOGLE_BOOKS_API_KEY}`);
        
        if (!response.ok) {
          throw new Error(`Erro HTTP! Status: ${response.status}`);
        }

        const data = await response.json();
        
        const apiBooks = data.items ? data.items.map(item => ({
          id: item.id,
          title: item.volumeInfo.title || 'Título Desconhecido',
          author: item.volumeInfo.authors ? item.volumeInfo.authors.join(', ') : 'Autor Desconhecido',
          cover: item.volumeInfo.imageLinks ? item.volumeInfo.imageLinks.thumbnail : 'https://via.placeholder.com/128x190?text=Sem+Capa',
          status: 'available', // A API do Google Books não fornece status de empréstimo
          genre: item.volumeInfo.categories && item.volumeInfo.categories.length > 0 ? item.volumeInfo.categories[0] : 'Geral'
        })) : [];

        lastApiResults = apiBooks; // Armazena os resultados da API
        renderBooks(lastApiResults); // Renderiza os livros obtidos da API

      } catch (error) {
        console.error("Erro ao buscar livros da API do Google Books:", error);
        grid.innerHTML = '<p class="empty-message">Ocorreu um erro ao buscar os livros. Tente novamente mais tarde.</p>';
        lastApiResults = []; // Limpa os resultados em caso de erro
      }
    }

    // Carrega favoritos e atualiza o contador ao carregar a página
    document.addEventListener('DOMContentLoaded', () => {
      updateFavoriteCount();
      // Ativa o botão "Todos" por padrão na inicialização
      document.querySelector('.genre-btn[onclick="filterByGenre(\'all\')"]').classList.add('active');
    });

    // Busca ao pressionar Enter no campo de busca
    document.getElementById('searchInput').addEventListener('keypress', e => {
      if (e.key === 'Enter') searchBooks();
    });
 