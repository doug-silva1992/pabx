<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use OpenApi\Attributes as OA;
use Throwable;

class HealthController extends Controller
{
    #[OA\Get(
        path: '/health',
        summary: 'Verifica se a API está no ar',
        tags: ['Health'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'API funcionando',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'status', type: 'string', example: 'ok'),
                        new OA\Property(property: 'database', type: 'string', example: 'ok'),
                        new OA\Property(property: 'timestamp', type: 'string', format: 'date-time'),
                    ],
                ),
            ),
        ],
    )]
    public function __invoke(): JsonResponse
    {
        try {
            DB::connection()->getPdo();
            $database = 'ok';
        } catch (Throwable) {
            $database = 'unavailable';
        }

        return response()->json([
            'status' => 'ok',
            'database' => $database,
            'timestamp' => now()->toIso8601String(),
        ]);
    }
}
