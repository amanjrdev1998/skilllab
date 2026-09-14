<?php

declare(strict_types=1);

require dirname(__DIR__) . '/bootstrap.php';

use App\Core\Request;
use App\Core\Response;
use App\Core\Router;
use App\Middleware\CorsMiddleware;
use App\Routes\ApiRoutes;

$request = Request::capture();
$response = new Response();

(new CorsMiddleware())->handle($request, $response);

$router = new Router($request, $response);
ApiRoutes::register($router);
$router->dispatch();




