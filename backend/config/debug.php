<?php

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/../logs/error.log');

// Create logs directory if it doesn't exist
$logDir = __DIR__ . '/../logs';
if (!is_dir($logDir)) {
    mkdir($logDir, 0777, true);
}

// Set debug mode
define('DEBUG_MODE', true);

// Custom error handler
function debugHandler($errno, $errstr, $errfile, $errline) {
    $message = "[Error $errno] $errstr in $errfile on line $errline";
    error_log($message);
    
    if (DEBUG_MODE) {
        echo "<pre style='color: red;'>";
        echo "Error: $errstr\n";
        echo "File: $errfile\n";
        echo "Line: $errline\n";
        echo "</pre>";
    }
    return true;
}

set_error_handler('debugHandler');

// Exception handler
function exceptionHandler($exception) {
    $message = "[Exception] " . $exception->getMessage() . 
               " in " . $exception->getFile() . 
               " on line " . $exception->getLine();
    error_log($message);
    
    if (DEBUG_MODE) {
        echo "<pre style='color: red;'>";
        echo "Exception: " . $exception->getMessage() . "\n";
        echo "File: " . $exception->getFile() . "\n";
        echo "Line: " . $exception->getLine() . "\n";
        echo "Stack Trace:\n" . $exception->getTraceAsString();
        echo "</pre>";
    }
}

set_exception_handler('exceptionHandler');

return [
    'debug' => true,
    'log_path' => __DIR__ . '/../logs/error.log'
];