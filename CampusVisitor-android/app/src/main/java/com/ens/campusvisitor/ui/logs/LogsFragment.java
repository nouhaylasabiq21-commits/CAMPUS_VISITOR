package com.ens.campusvisitor.ui.logs;

import android.os.Bundle;
import android.view.*;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;
import com.ens.campusvisitor.R;
import com.ens.campusvisitor.api.ApiManager;
import org.json.JSONArray;

public class LogsFragment extends Fragment {

    private ApiManager api;
    private LogAdapter adapter;
    private SwipeRefreshLayout swipeRefresh;

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_logs, container, false);

        api = new ApiManager(requireContext());

        RecyclerView rv = view.findViewById(R.id.rvLogs);
        rv.setLayoutManager(new LinearLayoutManager(requireContext()));
        adapter = new LogAdapter(new JSONArray(), requireContext());
        rv.setAdapter(adapter);

        swipeRefresh = view.findViewById(R.id.swipeRefresh);
        swipeRefresh.setOnRefreshListener(this::loadLogs);
        loadLogs();
        return view;
    }

    private void loadLogs() {
        api.getLogs(new ApiManager.ArrayCallback() {
            @Override public void onSuccess(JSONArray r) {
                adapter.updateData(r);
                swipeRefresh.setRefreshing(false);
            }
            @Override public void onError(String m) {
                swipeRefresh.setRefreshing(false);
                Toast.makeText(requireContext(), "Erreur: " + m, Toast.LENGTH_SHORT).show();
            }
        });
    }
}
