<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    // Se não estiver logado, redireciona para login
    header("Location: login.php");
    exit;
}
?>
