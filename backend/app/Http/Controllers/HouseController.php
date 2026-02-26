<?php

namespace App\Http\Controllers;

use App\Models\House;
use App\Models\HouseResidentHistory;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class HouseController extends Controller
{
    /**
     * Display a listing of houses
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $houses = House::with(['houseResidentHistories.resident', 'bills'])->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Houses retrieved successfully',
            'data' => $houses
        ], 200);
    }

    /**
     * Store a newly created house
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'code' => 'required|string|unique:houses,code|max:50',
            'status' => ['required', Rule::in(['occupied', 'vacant'])],
        ]);

        $house = House::create([
            'code' => $request->code,
            'status' => $request->status,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'House created successfully',
            'data' => $house
        ], 201);
    }

    /**
     * Display the specified house
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $house = House::with(['houseResidentHistories.resident', 'bills.payments'])->find($id);

        if (!$house) {
            return response()->json([
                'status' => 'error',
                'message' => 'House not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'House retrieved successfully',
            'data' => $house
        ], 200);
    }

    /**
     * Update the specified house
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $house = House::find($id);

        if (!$house) {
            return response()->json([
                'status' => 'error',
                'message' => 'House not found'
            ], 404);
        }

        $request->validate([
            'code' => 'sometimes|required|string|max:50|unique:houses,code,' . $id,
            'status' => ['sometimes', 'required', Rule::in(['occupied', 'vacant'])],
        ]);

        $house->update($request->only(['code', 'status']));

        return response()->json([
            'status' => 'success',
            'message' => 'House updated successfully',
            'data' => $house
        ], 200);
    }

    /**
     * Remove the specified house
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $house = House::find($id);

        if (!$house) {
            return response()->json([
                'status' => 'error',
                'message' => 'House not found'
            ], 404);
        }

        $house->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'House deleted successfully'
        ], 200);
    }

    /**
     * Assign a resident to a house
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function assignResident(Request $request, $id)
    {
        $house = House::find($id);

        if (!$house) {
            return response()->json([
                'status' => 'error',
                'message' => 'House not found'
            ], 404);
        }

        $request->validate([
            'resident_id' => 'required|exists:residents,id',
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
        ]);

        // End previous active resident history
        HouseResidentHistory::where('house_id', $id)
            ->whereNull('end_date')
            ->update(['end_date' => now()]);

        // Create new resident history
        $history = HouseResidentHistory::create([
            'house_id' => $id,
            'resident_id' => $request->resident_id,
            'start_date' => $request->start_date,
            'end_date' => $request->end_date,
        ]);

        // Update house status
        $house->update(['status' => 'occupied']);

        return response()->json([
            'status' => 'success',
            'message' => 'Resident assigned to house successfully',
            'data' => $history->load('resident')
        ], 201);
    }

    /**
     * Remove resident from a house
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function removeResident($id)
    {
        $house = House::find($id);

        if (!$house) {
            return response()->json([
                'status' => 'error',
                'message' => 'House not found'
            ], 404);
        }

        // End active resident history
        $updated = HouseResidentHistory::where('house_id', $id)
            ->whereNull('end_date')
            ->update(['end_date' => now()]);

        if (!$updated) {
            return response()->json([
                'status' => 'error',
                'message' => 'No active resident found in this house'
            ], 404);
        }

        // Update house status
        $house->update(['status' => 'vacant']);

        return response()->json([
            'status' => 'success',
            'message' => 'Resident removed from house successfully'
        ], 200);
    }

    /**
     * Get resident history of a house
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getResidentHistory($id)
    {
        $house = House::find($id);

        if (!$house) {
            return response()->json([
                'status' => 'error',
                'message' => 'House not found'
            ], 404);
        }

        $history = HouseResidentHistory::where('house_id', $id)
            ->with('resident')
            ->orderBy('start_date', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Resident history retrieved successfully',
            'data' => $history
        ], 200);
    }

    /**
     * Get payment history of a house
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function getPaymentHistory($id)
    {
        $house = House::find($id);

        if (!$house) {
            return response()->json([
                'status' => 'error',
                'message' => 'House not found'
            ], 404);
        }

        $bills = $house->bills()
            ->with(['resident', 'payments'])
            ->orderBy('billing_year', 'desc')
            ->orderBy('billing_month', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Payment history retrieved successfully',
            'data' => $bills
        ], 200);
    }
}
