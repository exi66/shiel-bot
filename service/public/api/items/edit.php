<?php
header('Content-Type: application/json; charset=utf-8');
require_once(dirname(dirname(__DIR__)) . '/bootstrap.php');

use Rakit\Validation\Validator;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  exit();
}

$json = json_decode(file_get_contents('php://input'), true) ?? [];

$validator = new Validator;

$validation = $validator->make($_REQUEST + $json, [
  'token' => 'required',
  'items' => 'array'
]);

$validation->validate();

if ($validation->fails()) {
  echo json_encode(['errors' => $validation->errors()->all()], true);
  exit();
}

$validData = $validation->getValidData();

$link = Link::where('link', $validData['token'])->first();
if (!$link) {
  http_response_code(401);
  exit();
}
$user = $link->user()->first();

$user->items = $validData['items'] ?? [];
$user->save();

echo json_encode(['result' => 'success']);
