<?php
session_start();
include 'db.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';

    $stmt = $conn->prepare("SELECT id, password FROM login WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $stmt->bind_result($user_id, $hashed_password);
    $stmt->fetch();
    $stmt->close();

    if ($user_id && password_verify($password, $hashed_password)) {
        $_SESSION['username'] = $username;
        header("Location: favoritos.php");
        exit;
    } else {
        $erro = "Usuário ou senha inválidos.";
    }
}
?>

<form method="POST">
  <input type="text" name="username" placeholder="Usuário" required>
  <input type="password" name="password" placeholder="Senha" required>
  <button type="submit">Entrar</button>
  <?php if (isset($erro)) echo "<p>$erro</p>"; ?>
</form>
