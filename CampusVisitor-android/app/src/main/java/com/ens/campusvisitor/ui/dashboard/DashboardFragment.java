package com.ens.campusvisitor.ui.dashboard;

import android.os.Bundle;
import android.view.*;
import android.widget.TextView;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.ens.campusvisitor.MainActivity;
import com.ens.campusvisitor.R;
import com.ens.campusvisitor.api.ApiManager;
import com.ens.campusvisitor.ui.visits.VisitAdapter;
import com.ens.campusvisitor.utils.SessionManager;

import org.json.JSONArray;
import org.json.JSONObject;

import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Locale;

public class DashboardFragment extends Fragment {

    private ApiManager api;
    private SessionManager session;

    private TextView tvGreeting, tvDate;
    private TextView tvPresent, tvToday, tvPending, tvRefused;
    private TextView tvPresentLabel, tvTodayLabel, tvPendingLabel, tvRefusedLabel;
    private TextView tvRecentTitle, btnLogout;

    private RecyclerView rvRecentVisits;
    private SwipeRefreshLayout swipeRefresh;

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_dashboard, container, false);

        api = new ApiManager(requireContext());
        session = new SessionManager(requireContext());

        tvGreeting = view.findViewById(R.id.tvGreeting);
        tvDate = view.findViewById(R.id.tvDate);

        tvPresent = view.findViewById(R.id.tvPresent);
        tvToday = view.findViewById(R.id.tvToday);
        tvPending = view.findViewById(R.id.tvPending);
        tvRefused = view.findViewById(R.id.tvRefused);

        tvPresentLabel = view.findViewById(R.id.tvPresentLabel);
        tvTodayLabel = view.findViewById(R.id.tvTodayLabel);
        tvPendingLabel = view.findViewById(R.id.tvPendingLabel);
        tvRefusedLabel = view.findViewById(R.id.tvRefusedLabel);

        tvRecentTitle = view.findViewById(R.id.tvRecentTitle);
        btnLogout = view.findViewById(R.id.btnLogout);

        rvRecentVisits = view.findViewById(R.id.rvRecentVisits);
        swipeRefresh = view.findViewById(R.id.swipeRefresh);

        btnLogout.setOnClickListener(v -> {
            if (getActivity() instanceof MainActivity) {
                ((MainActivity) getActivity()).logout();
            }
        });

        rvRecentVisits.setLayoutManager(new LinearLayoutManager(requireContext()));

        setGreeting();
        setupLabelsByRole();

        swipeRefresh.setOnRefreshListener(this::loadData);
        loadData();

        return view;
    }

    private void setGreeting() {
        String name = session.getUserName();

        if (name != null && !name.trim().isEmpty()) {
            int hour = Integer.parseInt(new SimpleDateFormat("HH", Locale.getDefault()).format(new Date()));
            String gr = hour < 12 ? "Bonjour" : hour < 18 ? "Bon après-midi" : "Bonsoir";
            tvGreeting.setText(gr + ", " + name.split(" ")[0]);
        }

        tvDate.setText(new SimpleDateFormat("EEEE d MMMM yyyy", Locale.FRENCH).format(new Date()));
    }

    private void setupLabelsByRole() {
        if ("visitor".equals(session.getUserRole())) {
            tvPresentLabel.setText("Mes demandes");
            tvTodayLabel.setText("Approuvées");
            tvPendingLabel.setText("En attente");
            tvRefusedLabel.setText("Terminées");
            tvRecentTitle.setText("Mes rendez-vous récents");
        } else {
            tvPresentLabel.setText("Présents");
            tvTodayLabel.setText("Aujourd'hui");
            tvPendingLabel.setText("En attente");
            tvRefusedLabel.setText("Refusées/Annulées");
            tvRecentTitle.setText("Visites récentes");
        }
    }

    private void loadData() {
        if ("visitor".equals(session.getUserRole())) {
            loadVisitorDashboard();
        } else {
            loadNormalDashboard();
        }
    }

    private void loadVisitorDashboard() {
        api.getVisits(null, new ApiManager.ArrayCallback() {
            @Override
            public void onSuccess(JSONArray allVisits) {
                try {
                    JSONArray myVisits = new JSONArray();

                    int total = 0;
                    int approved = 0;
                    int pending = 0;
                    int completed = 0;

                    int myId = session.getUserId();

                    for (int i = 0; i < allVisits.length(); i++) {
                        JSONObject visit = allVisits.getJSONObject(i);

                        if (visit.optInt("visitor_id") == myId) {
                            myVisits.put(visit);
                            total++;

                            String status = visit.optString("status", "");

                            if ("approved".equals(status)) approved++;
                            if ("pending".equals(status)) pending++;
                            if ("completed".equals(status)) completed++;
                        }
                    }

                    tvPresent.setText(String.valueOf(total));
                    tvToday.setText(String.valueOf(approved));
                    tvPending.setText(String.valueOf(pending));
                    tvRefused.setText(String.valueOf(completed));

                    JSONArray recent = new JSONArray();
                    int count = Math.min(myVisits.length(), 5);

                    for (int i = 0; i < count; i++) {
                        recent.put(myVisits.getJSONObject(i));
                    }

                    rvRecentVisits.setAdapter(new VisitAdapter(recent, requireContext(), null));

                } catch (Exception e) {
                    e.printStackTrace();
                }

                swipeRefresh.setRefreshing(false);
            }

            @Override
            public void onError(String message) {
                swipeRefresh.setRefreshing(false);
            }
        });
    }

    private void loadNormalDashboard() {
        api.getDashboardStats(new ApiManager.ApiCallback() {
            @Override
            public void onSuccess(JSONObject r) {
                try {
                    tvPresent.setText(String.valueOf(r.getInt("visitors_present_now")));
                    tvToday.setText(String.valueOf(r.getInt("visits_today")));
                    tvPending.setText(String.valueOf(r.getInt("pending_visits")));
                    tvRefused.setText(String.valueOf(r.getInt("refused_visits") + r.getInt("cancelled_visits")));
                } catch (Exception e) {
                    e.printStackTrace();
                }

                swipeRefresh.setRefreshing(false);
            }

            @Override
            public void onError(String message) {
                swipeRefresh.setRefreshing(false);
            }
        });

        api.getVisits(null, new ApiManager.ArrayCallback() {
            @Override
            public void onSuccess(JSONArray r) {
                try {
                    JSONArray recent = new JSONArray();
                    int count = Math.min(r.length(), 6);

                    for (int i = 0; i < count; i++) {
                        recent.put(r.getJSONObject(i));
                    }

                    rvRecentVisits.setAdapter(new VisitAdapter(recent, requireContext(), null));

                } catch (Exception e) {
                    e.printStackTrace();
                }
            }

            @Override
            public void onError(String message) {
            }
        });
    }
}