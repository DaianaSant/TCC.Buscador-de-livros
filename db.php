<?php
$host = "localhost";   // servidor MySQL
$user = "root";        // usuário do MySQL
$pass = "";            // senha do MySQL
$db   = "mydb";        // nome do banco que você criou

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}
?>
