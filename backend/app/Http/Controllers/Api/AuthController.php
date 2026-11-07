<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\ValidationException;
use OpenApi\Attributes as OA;

class AuthController extends Controller
{
    #[OA\Post(
        path: '/auth/register',
        summary: 'Cria um novo usuário',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['name', 'email', 'password', 'password_confirmation'],
                properties: [
                    new OA\Property(property: 'name', type: 'string', example: 'Maria Silva'),
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'maria@empresa.com'),
                    new OA\Property(property: 'password', type: 'string', format: 'password', example: 'senha1234'),
                    new OA\Property(property: 'password_confirmation', type: 'string', format: 'password', example: 'senha1234'),
                ],
            ),
        ),
        responses: [
            new OA\Response(response: 201, description: 'Usuário criado', content: new OA\JsonContent(ref: '#/components/schemas/AuthResponse')),
            new OA\Response(response: 422, description: 'Dados inválidos'),
        ],
    )]
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'confirmed', Password::min(8)],
        ], [
            'name.required' => 'Informe o nome.',
            'email.required' => 'Informe o e-mail.',
            'email.email' => 'Informe um e-mail válido.',
            'email.unique' => 'Este e-mail já está cadastrado.',
            'password.required' => 'Informe a senha.',
            'password.confirmed' => 'As senhas não conferem.',
            'password.min' => 'A senha deve ter pelo menos 8 caracteres.',
        ]);

        $user = User::create($data);

        return response()->json([
            'token' => $user->createToken('frontend')->plainTextToken,
            'user' => $user,
        ], 201);
    }

    #[OA\Post(
        path: '/auth/login',
        summary: 'Autentica um usuário',
        tags: ['Auth'],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['email', 'password'],
                properties: [
                    new OA\Property(property: 'email', type: 'string', format: 'email', example: 'maria@empresa.com'),
                    new OA\Property(property: 'password', type: 'string', format: 'password', example: 'senha1234'),
                ],
            ),
        ),
        responses: [
            new OA\Response(response: 200, description: 'Login realizado', content: new OA\JsonContent(ref: '#/components/schemas/AuthResponse')),
            new OA\Response(response: 422, description: 'Credenciais inválidas'),
        ],
    )]
    public function login(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ], [
            'email.required' => 'Informe o e-mail.',
            'email.email' => 'Informe um e-mail válido.',
            'password.required' => 'Informe a senha.',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['E-mail ou senha inválidos.'],
            ]);
        }

        return response()->json([
            'token' => $user->createToken('frontend')->plainTextToken,
            'user' => $user,
        ]);
    }

    #[OA\Get(
        path: '/auth/me',
        summary: 'Retorna o usuário autenticado',
        security: [['sanctum' => []]],
        tags: ['Auth'],
        responses: [
            new OA\Response(response: 200, description: 'Usuário autenticado', content: new OA\JsonContent(ref: '#/components/schemas/User')),
            new OA\Response(response: 401, description: 'Não autenticado'),
        ],
    )]
    public function me(Request $request): JsonResponse
    {
        return response()->json($request->user());
    }

    #[OA\Post(
        path: '/auth/logout',
        summary: 'Encerra a sessão (revoga o token atual)',
        security: [['sanctum' => []]],
        tags: ['Auth'],
        responses: [
            new OA\Response(response: 204, description: 'Logout realizado'),
            new OA\Response(response: 401, description: 'Não autenticado'),
        ],
    )]
    public function logout(Request $request): Response
    {
        $request->user()->currentAccessToken()->delete();

        return response()->noContent();
    }
}
