<?php

namespace App\Http\Controllers;

use App\Models\Bill;
use App\Models\House;
use App\Models\HouseResidentHistory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BillController extends Controller
{
    /**
     * Display a listing of bills
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function index(Request $request)
    {
        $query = Bill::with(['resident', 'house', 'payments']);

        // Filter by month and year if provided
        if ($request->has('month')) {
            $query->where('billing_month', $request->month);
        }
        if ($request->has('year')) {
            $query->where('billing_year', $request->year);
        }
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $bills = $query->orderBy('billing_year', 'desc')
            ->orderBy('billing_month', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Bills retrieved successfully',
            'data' => $bills
        ], 200);
    }

    /**
     * Store a newly created bill
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'resident_id' => 'required|exists:residents,id',
            'house_id' => 'required|exists:houses,id',
            'billing_year' => 'required|integer|min:2000|max:2100',
            'billing_month' => 'required|integer|min:1|max:12',
            'due_date' => 'required|date',
            'security_fee' => 'required|numeric|min:0',
            'maintenance_fee' => 'required|numeric|min:0',
        ]);

        $total = $request->security_fee + $request->maintenance_fee;

        $bill = Bill::create([
            'resident_id' => $request->resident_id,
            'house_id' => $request->house_id,
            'billing_year' => $request->billing_year,
            'billing_month' => $request->billing_month,
            'due_date' => $request->due_date,
            'security_fee' => $request->security_fee,
            'maintenance_fee' => $request->maintenance_fee,
            'total' => $total,
            'status' => 'unpaid',
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Bill created successfully',
            'data' => $bill->load(['resident', 'house'])
        ], 201);
    }

    /**
     * Display the specified bill
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $bill = Bill::with(['resident', 'house', 'payments'])->find($id);

        if (!$bill) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bill not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Bill retrieved successfully',
            'data' => $bill
        ], 200);
    }

    /**
     * Update the specified bill
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $bill = Bill::find($id);

        if (!$bill) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bill not found'
            ], 404);
        }

        $request->validate([
            'resident_id' => 'sometimes|required|exists:residents,id',
            'house_id' => 'sometimes|required|exists:houses,id',
            'billing_year' => 'sometimes|required|integer|min:2000|max:2100',
            'billing_month' => 'sometimes|required|integer|min:1|max:12',
            'due_date' => 'sometimes|required|date',
            'security_fee' => 'sometimes|required|numeric|min:0',
            'maintenance_fee' => 'sometimes|required|numeric|min:0',
            'status' => ['sometimes', 'required', Rule::in(['unpaid', 'partial', 'paid'])],
        ]);

        $data = $request->only([
            'resident_id', 'house_id', 'billing_year', 'billing_month',
            'due_date', 'security_fee', 'maintenance_fee', 'status'
        ]);

        // Recalculate total if fees are updated
        if ($request->has('security_fee') || $request->has('maintenance_fee')) {
            $data['total'] = ($request->security_fee ?? $bill->security_fee) +
                            ($request->maintenance_fee ?? $bill->maintenance_fee);
        }

        $bill->update($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Bill updated successfully',
            'data' => $bill->load(['resident', 'house'])
        ], 200);
    }

    /**
     * Remove the specified bill
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $bill = Bill::find($id);

        if (!$bill) {
            return response()->json([
                'status' => 'error',
                'message' => 'Bill not found'
            ], 404);
        }

        $bill->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Bill deleted successfully'
        ], 200);
    }

    /**
     * Generate monthly bills for all occupied houses
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function generateMonthlyBills(Request $request)
    {
        $request->validate([
            'billing_year' => 'required|integer|min:2000|max:2100',
            'billing_month' => 'required|integer|min:1|max:12',
            'security_fee' => 'required|numeric|min:0',
            'maintenance_fee' => 'required|numeric|min:0',
            'due_date' => 'required|date',
        ]);

        $occupiedHouses = House::where('status', 'occupied')->get();
        $billsCreated = 0;
        $bills = [];

        foreach ($occupiedHouses as $house) {
            // Get current resident
            $currentResident = HouseResidentHistory::where('house_id', $house->id)
                ->whereNull('end_date')
                ->orWhere('end_date', '>=', now())
                ->with('resident')
                ->first();

            if ($currentResident) {
                // Check if bill already exists
                $existingBill = Bill::where('house_id', $house->id)
                    ->where('billing_year', $request->billing_year)
                    ->where('billing_month', $request->billing_month)
                    ->first();

                if (!$existingBill) {
                    $total = $request->security_fee + $request->maintenance_fee;

                    $bill = Bill::create([
                        'resident_id' => $currentResident->resident_id,
                        'house_id' => $house->id,
                        'billing_year' => $request->billing_year,
                        'billing_month' => $request->billing_month,
                        'due_date' => $request->due_date,
                        'security_fee' => $request->security_fee,
                        'maintenance_fee' => $request->maintenance_fee,
                        'total' => $total,
                        'status' => 'unpaid',
                    ]);

                    $bills[] = $bill->load(['resident', 'house']);
                    $billsCreated++;
                }
            }
        }

        return response()->json([
            'status' => 'success',
            'message' => "Generated {$billsCreated} bills successfully",
            'data' => $bills
        ], 201);
    }
}
