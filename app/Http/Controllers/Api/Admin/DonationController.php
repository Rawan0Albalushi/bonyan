<?php

namespace App\Http\Controllers\Api\Admin;

use App\Exports\DonationsExporter;
use App\Http\Controllers\Controller;
use App\Http\Resources\DonationResource;
use App\Models\Donation;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DonationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $donations = $this->filteredQuery($request)
            ->latest()
            ->paginate((int) $request->query('per_page', 10));

        return response()->json([
            'data' => DonationResource::collection($donations->items()),
            'meta' => [
                'current_page' => $donations->currentPage(),
                'last_page' => $donations->lastPage(),
                'per_page' => $donations->perPage(),
                'total' => $donations->total(),
            ],
        ]);
    }

    public function show(Donation $donation): JsonResponse
    {
        $donation->load('project');

        return response()->json(['data' => new DonationResource($donation)]);
    }

    public function export(Request $request, DonationsExporter $exporter): StreamedResponse
    {
        $locale = $request->getPreferredLanguage(['ar', 'en']) ?? 'ar';

        return $exporter->export($this->filteredQuery($request), $locale);
    }

    /** @return Builder<Donation> */
    private function filteredQuery(Request $request): Builder
    {
        return Donation::query()
            ->with('project')
            ->when($request->query('project_id'), fn ($q, $id) => $q->where('project_id', $id))
            ->when($request->query('search'), function ($q, $search) {
                $q->where(function ($query) use ($search) {
                    $query->where('phone', 'like', "%{$search}%")
                        ->orWhere('donor_name', 'like', "%{$search}%")
                        ->orWhere('reference', 'like', "%{$search}%");
                });
            });
    }
}
