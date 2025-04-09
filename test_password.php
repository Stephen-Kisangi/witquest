<?php
$password = 'Kisangimathenge1!'; // The password you're entering
$stored_hash = '$argon2id$v=19$m=65536,t=4,p=1$SmFHVldCQ1Y2MUp4bWRiVQ$SUF17Ima7kn/5SALlGXv55prvclfh5CQ3ZcEu6B0y+g'; // The stored hash

if (password_verify($password, $stored_hash)) {
    echo "✅ Password is CORRECT!";
} else {
    echo "❌ Password is INCORRECT!";
}
?>
