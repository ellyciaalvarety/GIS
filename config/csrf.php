<?php

/**
 * Default middleware excluded from CSRF verification
 */

return [
    'except' => [
        'api/*',
        'health',
        'up',
    ],
];
