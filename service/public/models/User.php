<?php

use Illuminate\Database\Eloquent\Model as Eloquent;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Casts\Attribute;

class User extends Eloquent
{
  use SoftDeletes;
  protected $table = 'users';

  /**
   * The attributes that are mass assignable.
   *
   * @var array
   */
  protected $fillable = [
    'discord_id',
    'notification_coupones',
    'notification_queue',
    'items'
  ];
  /**
   * The attributes that should be hidden for arrays.
   *
   * @var array
   */
  protected $hidden = [];
  /**
   * The attributes that should be translate to date.
   *
   * @var array
   */
  protected $dates = [
    'deleted_at',
    'created_at',
    'updated_at'
  ];
  /**
   * @return \Illuminate\Database\Eloquent\Casts\Attribute
   */
  protected function items(): Attribute
  {
    return Attribute::make(
      get: fn ($value) => json_decode($value, true),
      set: fn ($value) => json_encode($value),
    );
  }

  public function link()
  {
    return $this->hasOne('Link');
  }
}
