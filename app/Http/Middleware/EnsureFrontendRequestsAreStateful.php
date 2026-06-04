<?php

namespace App\Http\Middleware;

use Illuminate\Support\Str;
use Laravel\Sanctum\Http\Middleware\EnsureFrontendRequestsAreStateful as SanctumMiddleware;
use Laravel\Sanctum\Sanctum;

class EnsureFrontendRequestsAreStateful extends SanctumMiddleware
{
    /**
     * Treat same-host API requests as first-party SPA traffic when Referer/Origin
     * headers are missing (some clients omit them on XHR).
     */
    public static function fromFrontend($request): bool
    {
        if (parent::fromFrontend($request)) {
            return true;
        }

        $host = $request->getHost();

        foreach (array_filter(config('sanctum.stateful', [])) as $domain) {
            $domain = $domain === Sanctum::$currentRequestHostPlaceholder
                ? $host
                : $domain;

            if ($host === $domain || Str::endsWith($host, '.'.$domain)) {
                return true;
            }
        }

        return false;
    }
}
