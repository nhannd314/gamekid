<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

class AuthenticatedSessionController extends Controller
{
    /**
     * Show the login form.
     */
    public function create(Request $request): View
    {
        $redirect = $request->string('redirect')->toString();

        if ($redirect !== '' && $this->isSafeRedirectUrl($redirect, $request)) {
            $request->session()->put('url.intended', $redirect);
        }

        return view('auth.login');
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        $request->authenticate();

        $request->session()->regenerate();

        return redirect()->intended(route('home'));
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }

    /**
     * Determine if the given redirect URL points back to this application.
     */
    private function isSafeRedirectUrl(string $url, Request $request): bool
    {
        $host = parse_url($url, PHP_URL_HOST);

        return $host === null || $host === $request->getHost();
    }
}
