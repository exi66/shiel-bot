<?php

require_once(dirname(__DIR__) . '/bootstrap.php');


$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$pagename = basename($path, '.php');

$link = Link::where('link', preg_replace("/[^a-zA-Z0-9]+/", '', $pagename))->first();

if ($link) require_once(__DIR__ . '/views/index.php');
else require_once(__DIR__ . '/views/error.php');
