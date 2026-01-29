<?php
session_start();
include 'db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['username'])) {
  echo json_encode(["error" => "Usuário não está logado"]);
  exit;
}

$user = $_SESSION['username'];

$stmt = $conn->prepare("SELECT id FROM login WHERE username = ?");
$stmt->bind_param("s", $user);
$stmt->execute();
$stmt->bind_result($user_id);
$stmt->fetch();
$stmt->close();

if (!$user_id) {
  echo json_encode(["error" => "Usuário não encontrado"]);
  exit;
}

$query = $conn->prepare("SELECT book_id, title, author, cover, genre FROM favoritos WHERE user_id = ?");
$query->bind_param("i", $user_id);
$query->execute();
$result = $query->get_result();

$favoritos = [];
while ($row = $result->fetch_assoc()) {
  $favoritos[] = $row;
}

echo json_encode($favoritos);
$query->close();
$conn->close();
?>
