<?php

namespace App\Services;

use App\Enums\DonationStatus;
use App\Models\Project;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

class ProjectService
{
    public function getActiveProject(): ?Project
    {
        return Project::query()
            ->where('is_active', true)
            ->withCount([
                'donations as donations_count' => fn ($query) => $query->where('status', DonationStatus::Completed),
            ])
            ->orderBy('display_order')
            ->first();
    }

    public function listForAdmin(): Collection
    {
        return Project::query()
            ->withCount([
                'donations as donations_count' => fn ($query) => $query->where('status', DonationStatus::Completed),
            ])
            ->orderBy('display_order')
            ->orderByDesc('created_at')
            ->get();
    }

    public function paginateForAdmin(int $perPage = 15): LengthAwarePaginator
    {
        return Project::query()
            ->orderBy('display_order')
            ->orderByDesc('created_at')
            ->paginate($perPage);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function create(array $data): Project
    {
        if (! empty($data['is_active'])) {
            $this->deactivateOthers();
        }

        return Project::query()->create($data);
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function update(Project $project, array $data): Project
    {
        if (! empty($data['is_active'])) {
            $this->deactivateOthers($project->id);
        }

        $project->update($data);

        return $project->fresh();
    }

    public function delete(Project $project): void
    {
        $project->delete();
    }

    private function deactivateOthers(?int $exceptId = null): void
    {
        Project::query()
            ->when($exceptId, fn ($q) => $q->where('id', '!=', $exceptId))
            ->update(['is_active' => false]);
    }
}
