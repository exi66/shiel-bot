<?php

require_once(dirname(__DIR__) . '/bootstrap.php');

use Illuminate\Database\Capsule\Manager as Capsule;
use Illuminate\Database\Query\Expression;

Capsule::schema()->create('users', function ($table) {
  $table->id();
  $table->string('discord_id')->unique();
  $table->boolean('notification_coupones')->default(1);
  $table->boolean('notification_queue')->default(1);
  $table->json('items')->default(new Expression('(JSON_ARRAY())'));
  $table->softDeletes();
  $table->timestamps();
});
