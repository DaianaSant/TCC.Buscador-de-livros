<?php
session_start();
if (!isset($_SESSION['username'])) {
  header("Location: login.php");
  exit;
}
?>

<h2>Meus Favoritos</h2>
<div id="favoritos"></div>

<script>
fetch("get_favorites.php")
  .then(res => res.json())
  .then(data => {
    const container = document.getElementById("favoritos");

    if (data.error) {
      container.innerHTML = "<p>" + data.error + "</p>";
      return;
    }

    if (data.length === 0) {
      container.innerHTML = "<p>Nenhum favorito encontrado.</p>";
      return;
    }

    data.forEach(livro => {
      const card = document.createElement("div");
      card.innerHTML = `
        <img src="${livro.cover}" width="128" height="190">
        <h3>${livro.title}</h3>
        <p>${livro.author}</p>
        <p><strong>Gênero:</strong> ${livro.genre}</p>
        <hr>
      `;
      container.appendChild(card);
    });
  });
</script>
