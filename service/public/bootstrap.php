<?php
date_default_timezone_set('Europe/Moscow');
ini_set('error_log', __DIR__ . '/logs/' . date('Y-m-d') . '.log');

ini_set('display_errors', 0);
ini_set('display_startup_errors', 0);
ini_set('log_errors', 1);
error_reporting(E_ALL & ~E_WARNING & ~E_NOTICE & ~E_DEPRECATED);

require_once(__DIR__ . '/vendor/autoload.php');

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();

use Illuminate\Database\Capsule\Manager as Capsule;

$capsule = new Capsule;
$capsule->addConnection([
  'driver' => 'mysql',
  'host' => '127.0.0.1',
  'database' => $_ENV['DATABASE_NAME'],
  'username' => $_ENV['DATABASE_USER'],
  'password' => $_ENV['DATABASE_PASSWORD']
]);

$capsule->setAsGlobal();
$capsule->bootEloquent();
