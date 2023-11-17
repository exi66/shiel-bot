<?php

use Illuminate\Database\Eloquent\Model as Eloquent;

class Link extends Eloquent
{
  protected $table = 'links';

  /**
   * The attributes that are mass assignable.
   *
   * @var array
   */
  protected $fillable = [
    'user_id',
    'link',
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
    'created_at',
    'updated_at',
    'expired_at'
  ];

  public function user()
  {
    return $this->belongsTo('User');
  }
}
