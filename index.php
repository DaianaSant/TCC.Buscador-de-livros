<?php
session_start();
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Instituto Literário Lima & Moura - Biblioteca Online</title>
  <link rel="icon" type="image/png" href="img/logo.png" />
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header>
    <h1>Instituto Literário Lima & Moura</h1>
    <p>Seu buscador de livros moderno</p>

    <!-- Ícone de login -->
    <div class="login-icon" onclick="toggleLoginModal()">
      <img src="img/login.png" alt="Login" />
    </div>

    <!-- Mostra usuário logado -->
    <?php if (isset($_SESSION['username'])): ?>
      <div id="userDisplay">👤 <?php echo $_SESSION['username']; ?></div>
      <div id="loggedUser" style="display: none;"><?php echo htmlspecialchars($_SESSION['username']); ?></div>
    <?php endif; ?>
  </header>

  <?php if (isset($_SESSION['success'])): ?>
    <div class="success-message"><?php echo $_SESSION['success']; ?></div>
    <?php unset($_SESSION['success']); ?>
  <?php endif; ?>

  <?php if (isset($_SESSION['error'])): ?>
    <div class="error-message"><?php echo $_SESSION['error']; ?></div>
    <?php unset($_SESSION['error']); ?>
  <?php endif; ?>

  <div class="container">
    <!-- Barra de busca + gêneros -->
    <div class="search-section">
      <div class="search-bar">
        <input type="search" id="searchInput" placeholder="Busque por título, autor ou ISBN...">
        <button onclick="searchBooks()">Buscar</button>
      </div>
      <div id="suggestions" class="suggestions"></div>

      <div class="genres">
        <button class="genre-btn active" onclick="filterByGenre('all')">Todos</button>
        <button class="genre-btn" onclick="filterByGenre('Fantasia')">Fantasia</button>
        <button class="genre-btn" onclick="filterByGenre('Ficção Científica')">Ficção Científica</button>
        <button class="genre-btn" onclick="filterByGenre('Distopia')">Distopia</button>
        <button class="genre-btn" onclick="filterByGenre('Não Ficção')">Não Ficção</button>
      </div>
    </div>

    <!-- Abas -->
    <div class="tabs">
      <button class="tab-button active" onclick="switchTab('all')">Todos os Livros</button>
      <button class="tab-button" onclick="switchTab('favorites')">❤️ Favoritos <span id="favCount"></span></button>
      <button class="tab-button" onclick="switchTab('history')">Histórico</button>
    </div>

    <!-- Aba Todos os Livros -->
    <div id="all-tab" class="tab-content active">
      <div class="books-grid" id="booksGrid">
        <p class="empty-message">Use a barra de busca para encontrar livros!</p>
      </div>
    </div>

    <!-- Aba Favoritos -->
    <div id="favorites-tab" class="tab-content">
      <div class="books-grid" id="favoritesGrid"></div>
      <div id="emptyFavorites" class="empty-message">Nenhum livro nos favoritos ainda. Clique no coração para adicionar!</div>
    </div>

    <!-- Aba Histórico -->
    <div id="history-tab" class="tab-content">
      <div id="historyList"></div>
      <div id="emptyHistory" class="empty-message">Nenhum histórico de buscas ainda.</div>
    </div>
  </div>

  <!-- Modal de Login/Cadastro -->
  <div id="loginModal" class="modal">
    <div class="modal-content">
      <span class="close" onclick="toggleLoginModal()">&times;</span>
      <h2>Login</h2>
      <form id="loginForm" action="login.php" method="POST">
        <input type="text" name="username" placeholder="Usuário" required>
        <input type="password" name="password" placeholder="Senha" required>
        <button type="submit">Login</button>
      </form>

      <h2>Cadastro</h2>
      <form action="register.php" method="POST">
        <input type="text" name="username" placeholder="Novo Usuário" required>
        <input type="email" name="email" placeholder="Email" required>
        <input type="password" name="password" placeholder="Senha" required>
        <button type="submit">Cadastrar</button>
      </form>
    </div>
  </div>

  <!-- rodapé -->
  <footer>
    <div class="footer-content">
      <div class="partners">
        <h3>Empresas Parceiras</h3>
        <ul>
          <ul>
  <li><a href="https://southorizontravel.netlify.app/">South Horizon Travel</a></li>
  <li><a href="https://linktr.ee/redecalabria?utm_source=ig&utm_medium=social&utm_content=link_in_bio&fbclid=PAZXh0bgNhZW0CMTEAc3J0YwZhcHBfaWQMMjU2MjgxMDQwNTU4AAGn6ZSAyRHLs4KFKnycdy1ivBiRWdK3_W5AteSBGFOPdYsuroIVPZWKdX5uuJw_aem_qrs3_NZPRKmAbsibbqJ9zQ">Rede Calábria</a></li>
  <li><a href="https://academiaprolife.onrender.com/">Academia pro life</a></li>
</ul>

        </ul>
      </div>
      <div class="social-media">
        <h3>Nossas Redes Sociais</h3>
        <div class="social-links">
          <a href="https://www.tiktok.com/@losprogramadoreszitos?_r=1&_t=ZS-93TdvBHN3Ld" target="_blank">Tiktok</a>
          <a href="https://www.instagram.com/instituto_lima_moura?igsh=cjJ0MjkyaGxpYmc1" target="_blank">Instagram</a>
          <a href="https://wa.me/5551091299926?text=Ol%C3%A1%2C%20Vim%20pelo%20link!%20" target="_blank">Whatsapp</a>
        </div>
      </div>
    </div>
  </footer>

  <script src="script.js"></script>
</body>
</html>
