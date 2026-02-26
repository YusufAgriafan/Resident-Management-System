<?php

namespace App\Http\Controllers;

use App\Models\Payment;
use App\Models\Bill;
use Illuminate\Http\Request;

class PaymentController extends Controller
{
    /**
     * Display a listing of payments
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Payment::with(['bill.resident', 'bill.house']);

        // Filter by date range if provided
        if ($request->has('start_date')) {
            $query->where('payment_date', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->where('payment_date', '<=', $request->end_date);
        }

        $payments = $query->orderBy('payment_date', 'desc')->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Payments retrieved successfully',
            'data' => $payments
        ], 200);
    }

    /**
     * Store a newly created payment
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'bill_id' => 'required|exists:bills,id',
            'paid_amount' => 'required|numeric|min:0',
            'payment_date' => 'required|date',
            'payment_method' => 'required|string|max:50',
            'notes' => 'nullable|string',
        ]);

        $bill = Bill::find($request->bill_id);

        // Check if payment amount is valid
        $totalPaid = $bill->payments()->sum('paid_amount');
        $remaining = $bill->total - $totalPaid;

        if ($request->paid_amount > $remaining) {
            return response()->json([
                'status' => 'error',
                'message' => "Payment amount exceeds remaining balance. Remaining: {$remaining}"
            ], 422);
        }

        $payment = Payment::create([
            'bill_id' => $request->bill_id,
            'paid_amount' => $request->paid_amount,
            'payment_date' => $request->payment_date,
            'payment_method' => $request->payment_method,
            'notes' => $request->notes,
        ]);

        // Update bill status
        $newTotalPaid = $totalPaid + $request->paid_amount;
        if ($newTotalPaid >= $bill->total) {
            $bill->update(['status' => 'paid']);
        } elseif ($newTotalPaid > 0) {
            $bill->update(['status' => 'partial']);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Payment recorded successfully',
            'data' => $payment->load(['bill.resident', 'bill.house'])
        ], 201);
    }

    /**
     * Display the specified payment
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $payment = Payment::with(['bill.resident', 'bill.house'])->find($id);

        if (!$payment) {
            return response()->json([
                'status' => 'error',
                'message' => 'Payment not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Payment retrieved successfully',
            'data' => $payment
        ], 200);
    }

    /**
     * Update the specified payment
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $payment = Payment::find($id);

        if (!$payment) {
            return response()->json([
                'status' => 'error',
                'message' => 'Payment not found'
            ], 404);
        }

        $request->validate([
            'paid_amount' => 'sometimes|required|numeric|min:0',
            'payment_date' => 'sometimes|required|date',
            'payment_method' => 'sometimes|required|string|max:50',
            'notes' => 'nullable|string',
        ]);

        $bill = $payment->bill;

        // If updating paid_amount, validate the new amount
        if ($request->has('paid_amount')) {
            $totalPaid = $bill->payments()->where('id', '!=', $id)->sum('paid_amount');
            $remaining = $bill->total - $totalPaid;

            if ($request->paid_amount > $remaining) {
                return response()->json([
                    'status' => 'error',
                    'message' => "Payment amount exceeds remaining balance. Remaining: {$remaining}"
                ], 422);
            }
        }

        $payment->update($request->only([
            'paid_amount', 'payment_date', 'payment_method', 'notes'
        ]));

        // Recalculate bill status
        $totalPaid = $bill->payments()->sum('paid_amount');
        if ($totalPaid >= $bill->total) {
            $bill->update(['status' => 'paid']);
        } elseif ($totalPaid > 0) {
            $bill->update(['status' => 'partial']);
        } else {
            $bill->update(['status' => 'unpaid']);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Payment updated successfully',
            'data' => $payment->load(['bill.resident', 'bill.house'])
        ], 200);
    }

    /**
     * Remove the specified payment
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $payment = Payment::find($id);

        if (!$payment) {
            return response()->json([
                'status' => 'error',
                'message' => 'Payment not found'
            ], 404);
        }

        $bill = $payment->bill;
        $payment->delete();

        // Recalculate bill status after deletion
        $totalPaid = $bill->payments()->sum('paid_amount');
        if ($totalPaid >= $bill->total) {
            $bill->update(['status' => 'paid']);
        } elseif ($totalPaid > 0) {
            $bill->update(['status' => 'partial']);
        } else {
            $bill->update(['status' => 'unpaid']);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Payment deleted successfully'
        ], 200);
    }
}
