<?php
session_start();
include 'db.php';

if (!isset($_SESSION['username'])) {
    echo "Usuário não está logado.";
    exit;
}

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    $username = $_SESSION['username'];
    $book_id  = $data['book_id'];
    $title    = $data['title'];
    $author   = $data['author'];
    $cover    = $data['cover'];
    $genre    = $data['genre'];

    $stmt = $conn->prepare("SELECT id FROM login WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->bind_result($user_id);
    $stmt->fetch();
    $stmt->close();

    if (!$user_id) {
        echo "Usuário não encontrado.";
        exit;
    }

    $check = $conn->prepare("SELECT id FROM favoritos WHERE user_id = ? AND book_id = ?");
    $check->bind_param("is", $user_id, $book_id);
    $check->execute();
    $check->store_result();

    if ($check->num_rows > 0) {
        echo "Livro já está nos favoritos.";
        $check->close();
        exit;
    }
    $check->close();

    $insert = $conn->prepare("INSERT INTO favoritos (user_id, book_id, title, author, cover, genre) VALUES (?, ?, ?, ?, ?, ?)");
    $insert->bind_param("isssss", $user_id, $book_id, $title, $author, $cover, $genre);

    if ($insert->execute()) {
        echo "Livro favoritado com sucesso!";
    } else {
        echo "Erro ao favoritar: " . $insert->error;
    }

    $insert->close();
    $conn->close();
}
?>
