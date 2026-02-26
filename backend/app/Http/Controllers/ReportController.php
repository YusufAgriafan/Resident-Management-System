<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Expense;
use App\Models\Bill;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    /**
     * Get monthly summary report for a specific month
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function monthlySummary(Request $request)
    {
        $request->validate([
            'year' => 'required|integer|min:2000|max:2100',
            'month' => 'required|integer|min:1|max:12',
        ]);

        $year = $request->year;
        $month = $request->month;

        // Get income (payments) for the month
        $income = Payment::whereYear('payment_date', $year)
            ->whereMonth('payment_date', $month)
            ->sum('paid_amount');

        // Get expenses for the month
        $expenses = Expense::whereYear('expense_date', $year)
            ->whereMonth('expense_date', $month)
            ->sum('amount');

        // Get detailed expenses by category
        $expensesByCategory = Expense::whereYear('expense_date', $year)
            ->whereMonth('expense_date', $month)
            ->selectRaw('category, SUM(amount) as total_amount, COUNT(*) as count')
            ->groupBy('category')
            ->get();

        // Get payment details
        $payments = Payment::with(['bill.resident', 'bill.house'])
            ->whereYear('payment_date', $year)
            ->whereMonth('payment_date', $month)
            ->orderBy('payment_date', 'desc')
            ->get();

        // Get expense details
        $expenseDetails = Expense::whereYear('expense_date', $year)
            ->whereMonth('expense_date', $month)
            ->orderBy('expense_date', 'desc')
            ->get();

        $balance = $income - $expenses;

        return response()->json([
            'status' => 'success',
            'message' => 'Monthly summary retrieved successfully',
            'data' => [
                'year' => $year,
                'month' => $month,
                'summary' => [
                    'total_income' => $income,
                    'total_expenses' => $expenses,
                    'balance' => $balance,
                ],
                'expenses_by_category' => $expensesByCategory,
                'payments' => $payments,
                'expense_details' => $expenseDetails,
            ]
        ], 200);
    }

    /**
     * Get yearly summary report (12 months)
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function yearlySummary(Request $request)
    {
        $request->validate([
            'year' => 'required|integer|min:2000|max:2100',
        ]);

        $year = $request->year;
        $monthlySummary = [];

        for ($month = 1; $month <= 12; $month++) {
            // Get income (payments) for the month
            $income = Payment::whereYear('payment_date', $year)
                ->whereMonth('payment_date', $month)
                ->sum('paid_amount');

            // Get expenses for the month
            $expenses = Expense::whereYear('expense_date', $year)
                ->whereMonth('expense_date', $month)
                ->sum('amount');

            $balance = $income - $expenses;

            $monthlySummary[] = [
                'month' => $month,
                'month_name' => date('F', mktime(0, 0, 0, $month, 1)),
                'total_income' => $income,
                'total_expenses' => $expenses,
                'balance' => $balance,
            ];
        }

        // Calculate yearly totals
        $yearlyIncome = Payment::whereYear('payment_date', $year)->sum('paid_amount');
        $yearlyExpenses = Expense::whereYear('expense_date', $year)->sum('amount');
        $yearlyBalance = $yearlyIncome - $yearlyExpenses;

        return response()->json([
            'status' => 'success',
            'message' => 'Yearly summary retrieved successfully',
            'data' => [
                'year' => $year,
                'yearly_totals' => [
                    'total_income' => $yearlyIncome,
                    'total_expenses' => $yearlyExpenses,
                    'balance' => $yearlyBalance,
                ],
                'monthly_summary' => $monthlySummary,
            ]
        ], 200);
    }

    /**
     * Get unpaid bills report
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function unpaidBills()
    {
        $unpaidBills = Bill::with(['resident', 'house', 'payments'])
            ->whereIn('status', ['unpaid', 'partial'])
            ->orderBy('due_date', 'asc')
            ->get();

        $totalUnpaid = $unpaidBills->sum(function ($bill) {
            $paid = $bill->payments->sum('paid_amount');
            return $bill->total - $paid;
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Unpaid bills retrieved successfully',
            'data' => [
                'total_unpaid_amount' => $totalUnpaid,
                'unpaid_bills_count' => $unpaidBills->count(),
                'bills' => $unpaidBills,
            ]
        ], 200);
    }

    /**
     * Get overdue bills report
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function overdueBills()
    {
        $overdueBills = Bill::with(['resident', 'house', 'payments'])
            ->whereIn('status', ['unpaid', 'partial'])
            ->where('due_date', '<', now())
            ->orderBy('due_date', 'asc')
            ->get();

        $totalOverdue = $overdueBills->sum(function ($bill) {
            $paid = $bill->payments->sum('paid_amount');
            return $bill->total - $paid;
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Overdue bills retrieved successfully',
            'data' => [
                'total_overdue_amount' => $totalOverdue,
                'overdue_bills_count' => $overdueBills->count(),
                'bills' => $overdueBills,
            ]
        ], 200);
    }

    /**
     * Get dashboard statistics
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function dashboard()
    {
        $currentMonth = now()->month;
        $currentYear = now()->year;

        // Current month statistics
        $monthlyIncome = Payment::whereYear('payment_date', $currentYear)
            ->whereMonth('payment_date', $currentMonth)
            ->sum('paid_amount');

        $monthlyExpenses = Expense::whereYear('expense_date', $currentYear)
            ->whereMonth('expense_date', $currentMonth)
            ->sum('amount');

        // Unpaid bills
        $unpaidBillsCount = Bill::whereIn('status', ['unpaid', 'partial'])->count();
        $totalUnpaid = Bill::whereIn('status', ['unpaid', 'partial'])
            ->with('payments')
            ->get()
            ->sum(function ($bill) {
                $paid = $bill->payments->sum('paid_amount');
                return $bill->total - $paid;
            });

        // Overdue bills
        $overdueBillsCount = Bill::whereIn('status', ['unpaid', 'partial'])
            ->where('due_date', '<', now())
            ->count();

        // House statistics
        $totalHouses = DB::table('houses')->count();
        $occupiedHouses = DB::table('houses')->where('status', 'occupied')->count();
        $vacantHouses = DB::table('houses')->where('status', 'vacant')->count();

        // Total residents
        $totalResidents = DB::table('residents')->count();
        $permanentResidents = DB::table('residents')->where('resident_type', 'permanent')->count();
        $contractResidents = DB::table('residents')->where('resident_type', 'contract')->count();

        return response()->json([
            'status' => 'success',
            'message' => 'Dashboard statistics retrieved successfully',
            'data' => [
                'current_month' => [
                    'month' => $currentMonth,
                    'year' => $currentYear,
                    'income' => $monthlyIncome,
                    'expenses' => $monthlyExpenses,
                    'balance' => $monthlyIncome - $monthlyExpenses,
                ],
                'bills' => [
                    'unpaid_count' => $unpaidBillsCount,
                    'unpaid_amount' => $totalUnpaid,
                    'overdue_count' => $overdueBillsCount,
                ],
                'houses' => [
                    'total' => $totalHouses,
                    'occupied' => $occupiedHouses,
                    'vacant' => $vacantHouses,
                ],
                'residents' => [
                    'total' => $totalResidents,
                    'permanent' => $permanentResidents,
                    'contract' => $contractResidents,
                ],
            ]
        ], 200);
    }

    /**
     * Get income vs expenses chart data
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function chartData(Request $request)
    {
        $request->validate([
            'year' => 'required|integer|min:2000|max:2100',
        ]);

        $year = $request->year;
        $chartData = [];

        for ($month = 1; $month <= 12; $month++) {
            $income = Payment::whereYear('payment_date', $year)
                ->whereMonth('payment_date', $month)
                ->sum('paid_amount');

            $expenses = Expense::whereYear('expense_date', $year)
                ->whereMonth('expense_date', $month)
                ->sum('amount');

            $chartData[] = [
                'month' => $month,
                'month_name' => date('M', mktime(0, 0, 0, $month, 1)),
                'income' => (float) $income,
                'expenses' => (float) $expenses,
                'balance' => (float) ($income - $expenses),
            ];
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Chart data retrieved successfully',
            'data' => $chartData
        ], 200);
    }
}
