<?php

declare(strict_types=1);

namespace App\Core;

use PDO;

final class Database
{
    private static ?PDO $connection = null;

    public static function connection(): PDO
    {
        if (self::$connection === null) {
            global $config;
            $factory = require dirname(__DIR__, 2) . '/config/database.php';
            self::$connection = $factory();
        }

        return self::$connection;
    }
}
