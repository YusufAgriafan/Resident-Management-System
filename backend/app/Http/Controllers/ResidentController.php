<?php

namespace App\Http\Controllers;

use App\Models\Resident;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class ResidentController extends Controller
{
    /**
     * Display a listing of residents
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function index()
    {
        $residents = Resident::with('houseResidentHistories.house')->get();

        return response()->json([
            'status' => 'success',
            'message' => 'Residents retrieved successfully',
            'data' => $residents
        ], 200);
    }

    /**
     * Store a newly created resident
     *
     * @param Request $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'ktp' => 'required|image|mimes:jpeg,png,jpg|max:2048',
            'phone' => 'required|string|max:20',
            'resident_type' => ['required', Rule::in(['permanent', 'contract'])],
            'marital_status' => ['required', Rule::in(['single', 'married'])],
        ]);

        // Handle KTP image upload
        $ktpPath = $request->file('ktp')->store('ktp', 'public');

        $resident = Resident::create([
            'name' => $request->name,
            'ktp' => $ktpPath,
            'phone' => $request->phone,
            'resident_type' => $request->resident_type,
            'marital_status' => $request->marital_status,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Resident created successfully',
            'data' => $resident
        ], 201);
    }

    /**
     * Display the specified resident
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function show($id)
    {
        $resident = Resident::with(['houseResidentHistories.house', 'bills'])->find($id);

        if (!$resident) {
            return response()->json([
                'status' => 'error',
                'message' => 'Resident not found'
            ], 404);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Resident retrieved successfully',
            'data' => $resident
        ], 200);
    }

    /**
     * Update the specified resident
     *
     * @param Request $request
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function update(Request $request, $id)
    {
        $resident = Resident::find($id);

        if (!$resident) {
            return response()->json([
                'status' => 'error',
                'message' => 'Resident not found'
            ], 404);
        }

        $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'ktp' => 'sometimes|required|image|mimes:jpeg,png,jpg|max:2048',
            'phone' => 'sometimes|required|string|max:20',
            'resident_type' => ['sometimes', 'required', Rule::in(['permanent', 'contract'])],
            'marital_status' => ['sometimes', 'required', Rule::in(['single', 'married'])],
        ]);

        $data = $request->only(['name', 'phone', 'resident_type', 'marital_status']);

        // Handle KTP image upload if provided
        if ($request->hasFile('ktp')) {
            // Delete old KTP image
            if ($resident->ktp) {
                Storage::disk('public')->delete($resident->ktp);
            }
            $data['ktp'] = $request->file('ktp')->store('ktp', 'public');
        }

        $resident->update($data);

        return response()->json([
            'status' => 'success',
            'message' => 'Resident updated successfully',
            'data' => $resident
        ], 200);
    }

    /**
     * Remove the specified resident
     *
     * @param int $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function destroy($id)
    {
        $resident = Resident::find($id);

        if (!$resident) {
            return response()->json([
                'status' => 'error',
                'message' => 'Resident not found'
            ], 404);
        }

        // Delete KTP image
        if ($resident->ktp) {
            Storage::disk('public')->delete($resident->ktp);
        }

        $resident->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Resident deleted successfully'
        ], 200);
    }
}
