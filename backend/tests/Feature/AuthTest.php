<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_usuario_pode_se_cadastrar(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Maria Silva',
            'email' => 'maria@empresa.com',
            'password' => 'senha1234',
            'password_confirmation' => 'senha1234',
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['token', 'user' => ['id', 'name', 'email']])
            ->assertJsonPath('user.email', 'maria@empresa.com');

        $this->assertDatabaseHas('users', ['email' => 'maria@empresa.com']);
    }

    public function test_cadastro_valida_os_dados(): void
    {
        User::factory()->create(['email' => 'maria@empresa.com']);

        $this->postJson('/api/auth/register', [
            'name' => '',
            'email' => 'maria@empresa.com',
            'password' => '123',
            'password_confirmation' => '456',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'password'])
            ->assertJsonPath('errors.email.0', 'Este e-mail já está cadastrado.');
    }

    public function test_usuario_pode_fazer_login(): void
    {
        User::factory()->create([
            'email' => 'maria@empresa.com',
            'password' => 'senha1234',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'maria@empresa.com',
            'password' => 'senha1234',
        ])
            ->assertOk()
            ->assertJsonStructure(['token', 'user']);
    }

    public function test_login_com_senha_errada_falha(): void
    {
        User::factory()->create([
            'email' => 'maria@empresa.com',
            'password' => 'senha1234',
        ]);

        $this->postJson('/api/auth/login', [
            'email' => 'maria@empresa.com',
            'password' => 'errada',
        ])
            ->assertUnprocessable()
            ->assertJsonPath('errors.email.0', 'E-mail ou senha inválidos.');
    }

    public function test_me_retorna_o_usuario_autenticado(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('id', $user->id);
    }

    public function test_me_exige_autenticacao(): void
    {
        $this->getJson('/api/auth/me')->assertUnauthorized();
    }

    public function test_logout_revoga_o_token(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/auth/logout')
            ->assertNoContent();

        $this->assertDatabaseCount('personal_access_tokens', 0);
    }
}
