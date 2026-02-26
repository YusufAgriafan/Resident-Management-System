<?php

namespace App\Http\Controllers;

use App\Models\Expense;
use Illuminate\Http\Request;

class ExpenseController extends Controller
{
    /**
     * Display a listing of expenses
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Expense::query();

        // Filter by date range if provided
        if ($request->has('start_date')) {
            $query->where('expense_date', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->where('expense_date', '<=', $request->end_date);
        }
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $expenses = $query->orderBy('expense_date', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Expenses retrieved successfully',
            'data' => $expenses
        ], 200);
    }

    /**
     * Store a newly created expense
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'expense_date' => 'required|date',
            'category' => 'required|string|max:100',
        ]);

        $expense = Expense::create([
            'title' => $request->title,
            'description' => $request->description,
            'amount' => $request->amount,
            'expense_date' => $request->expense_date,
            'category' => $request->category,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Expense created successfully',
            'data' => $expense
        ], 201);
    }

    /**
     * Display the specified expense
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $expense = Expense::find($id);

        if (!$expense) {
            return response()->json([
                'status' => 'error',
                'message' => 'Expense not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Expense retrieved successfully',
            'data' => $expense
        ], 200);
    }

    /**
     * Update the specified expense
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $expense = Expense::find($id);

        if (!$expense) {
            return response()->json([
                'status' => 'error',
                'message' => 'Expense not found'
            ], 404);
        }

        $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'amount' => 'sometimes|required|numeric|min:0',
            'expense_date' => 'sometimes|required|date',
            'category' => 'sometimes|required|string|max:100',
        ]);

        $expense->update($request->only([
            'title', 'description', 'amount', 'expense_date', 'category'
        ]));

        return response()->json([
            'status' => 'success',
            'message' => 'Expense updated successfully',
            'data' => $expense
        ], 200);
    }

    /**
     * Remove the specified expense
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $expense = Expense::find($id);

        if (!$expense) {
            return response()->json([
                'status' => 'error',
                'message' => 'Expense not found'
            ], 404);
        }

        $expense->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Expense deleted successfully'
        ], 200);
    }

    /**
     * Get expense categories with total amounts
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCategories(Request $request)
    {
        $query = Expense::query();

        // Filter by date range if provided
        if ($request->has('start_date')) {
            $query->where('expense_date', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->where('expense_date', '<=', $request->end_date);
        }

        $categories = $query->selectRaw('category, SUM(amount) as total_amount, COUNT(*) as count')
            ->groupBy('category')
            ->orderBy('total_amount', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Expense categories retrieved successfully',
            'data' => $categories
        ], 200);
    }
}
