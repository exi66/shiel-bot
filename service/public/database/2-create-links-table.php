<?php

require_once(dirname(__DIR__) . '/bootstrap.php');

use Illuminate\Database\Capsule\Manager as Capsule;

Capsule::schema()->create('links', function ($table) {
  $table->id();
  $table->unsignedBigInteger('user_id');
  $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
  $table->string('link')->unique();
  $table->timestamp('expired_at')->default(null);
  $table->timestamps();
});
