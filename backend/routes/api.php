<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ResidentController;
use App\Http\Controllers\HouseController;
use App\Http\Controllers\BillController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\ExpenseController;
use App\Http\Controllers\ReportController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    // User
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    // Residents
    Route::get('/residents', [ResidentController::class, 'index']);
    Route::post('/residents', [ResidentController::class, 'store']);
    Route::get('/residents/{id}', [ResidentController::class, 'show']);
    Route::post('/residents/{id}', [ResidentController::class, 'update']); // POST for multipart/form-data
    Route::delete('/residents/{id}', [ResidentController::class, 'destroy']);

    // Houses
    Route::get('/houses', [HouseController::class, 'index']);
    Route::post('/houses', [HouseController::class, 'store']);
    Route::get('/houses/{id}', [HouseController::class, 'show']);
    Route::put('/houses/{id}', [HouseController::class, 'update']);
    Route::delete('/houses/{id}', [HouseController::class, 'destroy']);
    Route::post('/houses/{id}/assign-resident', [HouseController::class, 'assignResident']);
    Route::post('/houses/{id}/remove-resident', [HouseController::class, 'removeResident']);
    Route::get('/houses/{id}/resident-history', [HouseController::class, 'getResidentHistory']);
    Route::get('/houses/{id}/payment-history', [HouseController::class, 'getPaymentHistory']);

    // Bills
    Route::get('/bills', [BillController::class, 'index']);
    Route::post('/bills', [BillController::class, 'store']);
    Route::get('/bills/{id}', [BillController::class, 'show']);
    Route::put('/bills/{id}', [BillController::class, 'update']);
    Route::delete('/bills/{id}', [BillController::class, 'destroy']);
    Route::post('/bills/generate-monthly', [BillController::class, 'generateMonthlyBills']);

    // Payments
    Route::get('/payments', [PaymentController::class, 'index']);
    Route::post('/payments', [PaymentController::class, 'store']);
    Route::get('/payments/{id}', [PaymentController::class, 'show']);
    Route::put('/payments/{id}', [PaymentController::class, 'update']);
    Route::delete('/payments/{id}', [PaymentController::class, 'destroy']);

    // Expenses
    Route::get('/expenses', [ExpenseController::class, 'index']);
    Route::post('/expenses', [ExpenseController::class, 'store']);
    Route::get('/expenses/{id}', [ExpenseController::class, 'show']);
    Route::put('/expenses/{id}', [ExpenseController::class, 'update']);
    Route::delete('/expenses/{id}', [ExpenseController::class, 'destroy']);
    Route::get('/expenses/categories/summary', [ExpenseController::class, 'getCategories']);

    // Reports
    Route::get('/reports/monthly-summary', [ReportController::class, 'monthlySummary']);
    Route::get('/reports/yearly-summary', [ReportController::class, 'yearlySummary']);
    Route::get('/reports/unpaid-bills', [ReportController::class, 'unpaidBills']);
    Route::get('/reports/overdue-bills', [ReportController::class, 'overdueBills']);
    Route::get('/reports/dashboard', [ReportController::class, 'dashboard']);
    Route::get('/reports/chart-data', [ReportController::class, 'chartData']);
});