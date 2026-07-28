<?php

namespace App\Models\Traits;

use App\Services\StrService;

trait HasSlug
{
    protected static function bootHasSlug()
    {
        static::creating(function ($model) {
            $source = $model->slugSource();

            $model->slug = StrService::generateUniqueSlug(
                get_class($model),
                $model->$source
            );
        });

        static::updating(function ($model) {
            $source = $model->slugSource();

            if ($model->isDirty($source)) {
                $model->slug = StrService::generateUniqueSlug(
                    get_class($model),
                    $model->$source
                );
            }
        });
    }

    protected function slugSource()
    {
        return 'title';
    }
}
