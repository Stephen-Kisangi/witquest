<?php
phpinfo();
// Or check algorithm support:
var_dump(password_get_info(password_hash('test', PASSWORD_ARGON2ID)));
?>