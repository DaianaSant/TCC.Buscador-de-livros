<?php
session_start();
include 'db.php';

if ($_SERVER["REQUEST_METHOD"] === "POST") {
    $username = trim($_POST['username']);
    $email    = trim($_POST['email']);
    $password = $_POST['password'];

    // Validação básica
    if (empty($username) || empty($email) || empty($password)) {
        $_SESSION['error'] = "Preencha todos os campos.";
        header("Location: index.php");
        exit;
    }

    // Verifica se o usuário já existe
    $check = $conn->prepare("SELECT id FROM login WHERE username = ? OR email = ?");
    $check->bind_param("ss", $username, $email);
    $check->execute();
    $check->store_result();

    if ($check->num_rows > 0) {
        $_SESSION['error'] = "Usuário ou e-mail já cadastrado.";
        $check->close();
        header("Location: index.php");
        exit;
    }
    $check->close();

    // Criptografa a senha
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insere novo usuário
    $stmt = $conn->prepare("INSERT INTO login (username, email, password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $username, $email, $hashedPassword);

    if ($stmt->execute()) {
        $_SESSION['success'] = "Cadastro realizado com sucesso!";
    } else {
        $_SESSION['error'] = "Erro ao cadastrar: " . $stmt->error;
    }

    $stmt->close();
    $conn->close();

    header("Location: index.php");
    exit;
}
?>
<?php session_start(); ?>
