package com.ens.campusvisitor.ui.checkin;

import android.os.Bundle;
import android.view.*;
import android.widget.*;
import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.ens.campusvisitor.R;
import com.ens.campusvisitor.api.ApiManager;
import com.ens.campusvisitor.ui.visits.VisitAdapter;
import org.json.JSONArray;
import org.json.JSONObject;

public class CheckInFragment extends Fragment {

    private ApiManager api;
    private VisitAdapter approvedAdapter, ongoingAdapter;
    private TextView tvApprovedCount, tvOngoingCount;

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_checkin, container, false);

        api             = new ApiManager(requireContext());
        tvApprovedCount = view.findViewById(R.id.tvApprovedCount);
        tvOngoingCount  = view.findViewById(R.id.tvOngoingCount);

        RecyclerView rvApproved = view.findViewById(R.id.rvApproved);
        RecyclerView rvOngoing  = view.findViewById(R.id.rvOngoing);

        rvApproved.setLayoutManager(new LinearLayoutManager(requireContext()));
        rvOngoing.setLayoutManager(new LinearLayoutManager(requireContext()));

        approvedAdapter = new VisitAdapter(new JSONArray(), requireContext(), new VisitAdapter.ActionListener() {
            @Override public void onApprove(int id)  {}
            @Override public void onRefuse(int id)   {}
            @Override public void onCheckIn(int id)  { doCheckIn(id); }
            @Override public void onCheckOut(int id) {}
        });

        ongoingAdapter = new VisitAdapter(new JSONArray(), requireContext(), new VisitAdapter.ActionListener() {
            @Override public void onApprove(int id)  {}
            @Override public void onRefuse(int id)   {}
            @Override public void onCheckIn(int id)  {}
            @Override public void onCheckOut(int id) { doCheckOut(id); }
        });

        rvApproved.setAdapter(approvedAdapter);
        rvOngoing.setAdapter(ongoingAdapter);

        view.findViewById(R.id.btnRefresh).setOnClickListener(v -> loadData());
        loadData();
        return view;
    }

    private void loadData() {
        api.getVisits("approved", new ApiManager.ArrayCallback() {
            @Override public void onSuccess(JSONArray r) {
                approvedAdapter.updateData(r);
                tvApprovedCount.setText(String.valueOf(r.length()));
            }
            @Override public void onError(String m) {}
        });
        api.getVisits("ongoing", new ApiManager.ArrayCallback() {
            @Override public void onSuccess(JSONArray r) {
                ongoingAdapter.updateData(r);
                tvOngoingCount.setText(String.valueOf(r.length()));
            }
            @Override public void onError(String m) {}
        });
    }

    private void doCheckIn(int id) {
        api.checkIn(id, new ApiManager.ApiCallback() {
            @Override public void onSuccess(JSONObject r) { loadData(); toast("Check-in enregistré"); }
            @Override public void onError(String m)       { toast(m); }
        });
    }

    private void doCheckOut(int id) {
        api.checkOut(id, new ApiManager.ApiCallback() {
            @Override public void onSuccess(JSONObject r) { loadData(); toast("Check-out enregistré"); }
            @Override public void onError(String m)       { toast(m); }
        });
    }

    private void toast(String msg) { Toast.makeText(requireContext(), msg, Toast.LENGTH_SHORT).show(); }
}
