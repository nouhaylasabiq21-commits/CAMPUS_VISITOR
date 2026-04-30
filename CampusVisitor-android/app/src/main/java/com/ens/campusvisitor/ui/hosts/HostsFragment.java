package com.ens.campusvisitor.ui.hosts;

import android.app.AlertDialog;
import android.os.Bundle;
import android.text.*;
import android.view.*;
import android.widget.*;
import androidx.annotation.NonNull;
import androidx.fragment.app.Fragment;
import androidx.recyclerview.widget.LinearLayoutManager;
import androidx.recyclerview.widget.RecyclerView;
import com.ens.campusvisitor.R;
import com.ens.campusvisitor.api.ApiManager;
import com.ens.campusvisitor.ui.visitors.PersonAdapter;
import com.ens.campusvisitor.utils.SessionManager;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.android.material.textfield.TextInputEditText;
import org.json.JSONArray;
import org.json.JSONObject;

public class HostsFragment extends Fragment {

    private ApiManager api;
    private PersonAdapter adapter;
    private SessionManager session;

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_visitors, container, false);

        api     = new ApiManager(requireContext());
        session = new SessionManager(requireContext());

        TextView tvTitle = view.findViewById(R.id.tvTitle);
        tvTitle.setText("Hôtes");

        RecyclerView rv = view.findViewById(R.id.rvItems);
        rv.setLayoutManager(new LinearLayoutManager(requireContext()));
        adapter = new PersonAdapter(new JSONArray(), requireContext(), "host",
            session.getUserRole(), id -> confirmDelete(id));
        rv.setAdapter(adapter);

        TextInputEditText etSearch = view.findViewById(R.id.etSearch);
        etSearch.addTextChangedListener(new TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int st, int c, int a) {}
            @Override public void onTextChanged(CharSequence s, int st, int b, int c) { load(s.toString()); }
            @Override public void afterTextChanged(Editable s) {}
        });

        FloatingActionButton fab = view.findViewById(R.id.fabAdd);
        if ("admin".equals(session.getUserRole())) {
            fab.setOnClickListener(v -> showCreateDialog());
        } else {
            fab.setVisibility(View.GONE);
        }

        load("");
        return view;
    }

    private void load(String search) {
        api.getHosts(search, new ApiManager.ArrayCallback() {
            @Override public void onSuccess(JSONArray r) { adapter.updateData(r); }
            @Override public void onError(String m) {}
        });
    }

    private void showCreateDialog() {
        LinearLayout layout = new LinearLayout(requireContext());
        layout.setOrientation(LinearLayout.VERTICAL); layout.setPadding(40, 20, 40, 20);

        EditText etName  = new EditText(requireContext()); etName.setHint("Nom complet");
        EditText etEmail = new EditText(requireContext()); etEmail.setHint("Email");
        EditText etPhone = new EditText(requireContext()); etPhone.setHint("Téléphone");
        EditText etDept  = new EditText(requireContext()); etDept.setHint("Département");
        EditText etPass  = new EditText(requireContext()); etPass.setHint("Mot de passe"); etPass.setInputType(android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD);

        layout.addView(etName); layout.addView(etEmail);
        layout.addView(etPhone); layout.addView(etDept); layout.addView(etPass);

        new AlertDialog.Builder(requireContext()).setTitle("Nouvel hôte").setView(layout)
            .setPositiveButton("Créer", (d, w) -> {
                try {
                    JSONObject body = new JSONObject();
                    body.put("name", etName.getText().toString());
                    body.put("email", etEmail.getText().toString());
                    body.put("phone", etPhone.getText().toString());
                    body.put("department", etDept.getText().toString());
                    body.put("password", etPass.getText().toString());
                    body.put("role", "host");
                    api.createHost(body, new ApiManager.ApiCallback() {
                        @Override public void onSuccess(JSONObject r) { load(""); toast("Hôte créé"); }
                        @Override public void onError(String m)       { toast(m); }
                    });
                } catch (Exception e) { toast("Erreur"); }
            })
            .setNegativeButton("Annuler", null).show();
    }

    private void confirmDelete(int id) {
        new AlertDialog.Builder(requireContext()).setTitle("Confirmer")
            .setMessage("Supprimer cet hôte ?")
            .setPositiveButton("Supprimer", (d, w) ->
                api.deleteHost(id, new ApiManager.ApiCallback() {
                    @Override public void onSuccess(JSONObject r) { load(""); toast("Supprimé"); }
                    @Override public void onError(String m)       { toast(m); }
                }))
            .setNegativeButton("Annuler", null).show();
    }

    private void toast(String msg) { Toast.makeText(requireContext(), msg, Toast.LENGTH_SHORT).show(); }
}
