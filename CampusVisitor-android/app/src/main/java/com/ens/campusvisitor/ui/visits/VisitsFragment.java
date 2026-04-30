package com.ens.campusvisitor.ui.visits;

import android.app.AlertDialog;
import android.app.DatePickerDialog;
import android.app.TimePickerDialog;
import android.os.Bundle;
import android.view.*;
import android.widget.*;

import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import androidx.swiperefreshlayout.widget.SwipeRefreshLayout;

import com.ens.campusvisitor.R;
import com.ens.campusvisitor.api.ApiManager;
import com.ens.campusvisitor.utils.SessionManager;
import com.google.android.material.floatingactionbutton.FloatingActionButton;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.Calendar;
import java.util.Locale;

public class VisitsFragment extends Fragment {

    private ApiManager api;
    private VisitAdapter adapter;
    private JSONArray visitsData = new JSONArray();
    private SwipeRefreshLayout swipeRefresh;
    private String currentFilter = "";
    private SessionManager session;

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_visits, container, false);

        api = new ApiManager(requireContext());
        session = new SessionManager(requireContext());

        RecyclerView rv = view.findViewById(R.id.rvVisits);
        rv.setLayoutManager(new LinearLayoutManager(requireContext()));

        adapter = new VisitAdapter(visitsData, requireContext(), new VisitAdapter.ActionListener() {
            @Override public void onApprove(int id) { updateStatus(id, "approved"); }
            @Override public void onRefuse(int id) { updateStatus(id, "refused"); }
            @Override public void onCheckIn(int id) { doCheckIn(id); }
            @Override public void onCheckOut(int id) { doCheckOut(id); }
        });

        rv.setAdapter(adapter);

        swipeRefresh = view.findViewById(R.id.swipeRefresh);
        swipeRefresh.setOnRefreshListener(this::loadVisits);

        LinearLayout llFilters = view.findViewById(R.id.llFilters);
        String[] filters = {"", "pending", "approved", "ongoing", "completed", "refused"};
        String[] labels = {"Tous", "En attente", "Approuvée", "En cours", "Terminée", "Refusée"};

        for (int i = 0; i < filters.length; i++) {
            Button btn = new Button(requireContext());
            btn.setText(labels[i]);
            btn.setTextSize(11f);
            btn.setAllCaps(false);
            btn.setTextColor(getResources().getColor(R.color.text_primary));
            btn.setBackgroundColor(getResources().getColor(R.color.surface2));

            final String f = filters[i];
            btn.setOnClickListener(v -> {
                currentFilter = f;
                loadVisits();
            });

            LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(
                    LinearLayout.LayoutParams.WRAP_CONTENT,
                    LinearLayout.LayoutParams.WRAP_CONTENT
            );
            p.setMargins(0, 0, 8, 0);
            btn.setLayoutParams(p);
            llFilters.addView(btn);
        }

        FloatingActionButton fab = view.findViewById(R.id.fabAddVisit);

        if ("visitor".equals(session.getUserRole())) {
            fab.setVisibility(View.VISIBLE);
            fab.setOnClickListener(v -> showCreateDialog());
        } else {
            fab.setVisibility(View.GONE);
        }

        loadVisits();
        return view;
    }

    private void loadVisits() {
        api.getVisits(currentFilter, new ApiManager.ArrayCallback() {
            @Override public void onSuccess(JSONArray r) {
                if ("visitor".equals(session.getUserRole())) {
                    visitsData = filterMyVisits(r);
                } else {
                    visitsData = r;
                }

                adapter.updateData(visitsData);
                swipeRefresh.setRefreshing(false);
            }

            @Override public void onError(String m) {
                swipeRefresh.setRefreshing(false);
                toast(m);
            }
        });
    }

    private JSONArray filterMyVisits(JSONArray allVisits) {
        JSONArray result = new JSONArray();
        int myId = session.getUserId();

        try {
            for (int i = 0; i < allVisits.length(); i++) {
                JSONObject visit = allVisits.getJSONObject(i);

                if (visit.optInt("visitor_id") == myId) {
                    result.put(visit);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }

        return result;
    }

    private void updateStatus(int id, String status) {
        api.updateVisitStatus(id, status, new ApiManager.ApiCallback() {
            @Override public void onSuccess(JSONObject r) {
                loadVisits();
                toast("Statut mis à jour");
            }

            @Override public void onError(String m) {
                toast(m);
            }
        });
    }

    private void doCheckIn(int id) {
        api.checkIn(id, new ApiManager.ApiCallback() {
            @Override public void onSuccess(JSONObject r) {
                loadVisits();
                toast("Check-in enregistré");
            }

            @Override public void onError(String m) {
                toast(m);
            }
        });
    }

    private void doCheckOut(int id) {
        api.checkOut(id, new ApiManager.ApiCallback() {
            @Override public void onSuccess(JSONObject r) {
                loadVisits();
                toast("Check-out enregistré");
            }

            @Override public void onError(String m) {
                toast(m);
            }
        });
    }

    private void showCreateDialog() {
        View dialogView = LayoutInflater.from(requireContext())
                .inflate(R.layout.dialog_new_visit, null);

        Spinner spVisitor = dialogView.findViewById(R.id.spVisitor);
        Spinner spHost = dialogView.findViewById(R.id.spHost);
        Button btnNewVisitor = dialogView.findViewById(R.id.btnNewVisitor);

        EditText etScheduled = dialogView.findViewById(R.id.etScheduled);
        EditText etPurpose = dialogView.findViewById(R.id.etPurpose);
        EditText etNotes = dialogView.findViewById(R.id.etNotes);

        Button btnCancel = dialogView.findViewById(R.id.btnCancel);
        Button btnCreate = dialogView.findViewById(R.id.btnCreate);

        // Pour le rôle visiteur : cacher choix visiteur + nouveau visiteur
        spVisitor.setVisibility(View.GONE);
        btnNewVisitor.setVisibility(View.GONE);

        final JSONArray[] hosts = {new JSONArray()};
        final String[] selectedDateTime = {""};

        ArrayAdapter<String> hostAdapter = new ArrayAdapter<>(
                requireContext(),
                android.R.layout.simple_spinner_dropdown_item
        );

        spHost.setAdapter(hostAdapter);
        loadHostsIntoSpinner(hosts, hostAdapter);

        etScheduled.setOnClickListener(v -> showDateTimePicker(etScheduled, selectedDateTime));

        AlertDialog dialog = new AlertDialog.Builder(requireContext())
                .setView(dialogView)
                .create();

        btnCancel.setOnClickListener(v -> dialog.dismiss());

        btnCreate.setOnClickListener(v -> {
            try {
                if (hosts[0].length() == 0) {
                    toast("Sélectionnez un hôte");
                    return;
                }

                if (selectedDateTime[0].isEmpty()) {
                    toast("Choisissez une date et une heure");
                    return;
                }

                String purpose = etPurpose.getText().toString().trim();
                if (purpose.isEmpty()) {
                    toast("Objet de la visite obligatoire");
                    return;
                }

                JSONObject host = hosts[0].getJSONObject(spHost.getSelectedItemPosition());

                JSONObject body = new JSONObject();
                body.put("visitor_id", session.getUserId());
                body.put("host_id", host.getInt("id"));
                body.put("purpose", purpose);
                body.put("scheduled_at", selectedDateTime[0]);
                body.put("notes", etNotes.getText().toString().trim());

                api.createVisit(body, new ApiManager.ApiCallback() {
                    @Override public void onSuccess(JSONObject r) {
                        dialog.dismiss();
                        loadVisits();
                        toast("Demande envoyée");
                    }

                    @Override public void onError(String m) {
                        toast(m);
                    }
                });

            } catch (Exception e) {
                toast("Données invalides");
            }
        });

        dialog.show();
    }

    private void loadHostsIntoSpinner(JSONArray[] hosts, ArrayAdapter<String> adapter) {
        api.getHosts("", new ApiManager.ArrayCallback() {
            @Override public void onSuccess(JSONArray r) {
                hosts[0] = r;
                adapter.clear();

                try {
                    for (int i = 0; i < r.length(); i++) {
                        JSONObject obj = r.getJSONObject(i);
                        adapter.add(obj.getString("name") + " - " + obj.optString("department", ""));
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                }

                adapter.notifyDataSetChanged();
            }

            @Override public void onError(String message) {
                toast(message);
            }
        });
    }

    private void showDateTimePicker(EditText etScheduled, String[] selectedDateTime) {
        Calendar calendar = Calendar.getInstance();

        DatePickerDialog datePicker = new DatePickerDialog(
                requireContext(),
                (view, year, month, dayOfMonth) -> {
                    TimePickerDialog timePicker = new TimePickerDialog(
                            requireContext(),
                            (timeView, hourOfDay, minute) -> {
                                String apiDate = String.format(
                                        Locale.getDefault(),
                                        "%04d-%02d-%02dT%02d:%02d:00",
                                        year,
                                        month + 1,
                                        dayOfMonth,
                                        hourOfDay,
                                        minute
                                );

                                String displayDate = String.format(
                                        Locale.getDefault(),
                                        "%02d/%02d/%04d à %02d:%02d",
                                        dayOfMonth,
                                        month + 1,
                                        year,
                                        hourOfDay,
                                        minute
                                );

                                selectedDateTime[0] = apiDate;
                                etScheduled.setText(displayDate);
                            },
                            calendar.get(Calendar.HOUR_OF_DAY),
                            calendar.get(Calendar.MINUTE),
                            true
                    );

                    timePicker.show();
                },
                calendar.get(Calendar.YEAR),
                calendar.get(Calendar.MONTH),
                calendar.get(Calendar.DAY_OF_MONTH)
        );

        datePicker.show();
    }

    private void toast(String msg) {
        Toast.makeText(requireContext(), msg, Toast.LENGTH_SHORT).show();
    }
}