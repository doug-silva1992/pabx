<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    title: 'PABX API',
    description: 'Documentação da API do PABX',
)]
#[OA\Server(url: '/api', description: 'API')]
abstract class Controller
{
    //
}
