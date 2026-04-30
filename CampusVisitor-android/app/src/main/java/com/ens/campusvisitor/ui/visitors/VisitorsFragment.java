package com.ens.campusvisitor.ui.visitors;

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
import com.ens.campusvisitor.utils.SessionManager;
import com.google.android.material.floatingactionbutton.FloatingActionButton;
import com.google.android.material.textfield.TextInputEditText;
import org.json.JSONArray;
import org.json.JSONObject;

public class VisitorsFragment extends Fragment {

    private ApiManager api;
    private PersonAdapter adapter;
    private SessionManager session;

    @Override
    public View onCreateView(@NonNull LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_visitors, container, false);

        api     = new ApiManager(requireContext());
        session = new SessionManager(requireContext());

        RecyclerView rv = view.findViewById(R.id.rvItems);
        rv.setLayoutManager(new LinearLayoutManager(requireContext()));
        adapter = new PersonAdapter(new JSONArray(), requireContext(), "visitor",
            session.getUserRole(), id -> confirmDelete(id));
        rv.setAdapter(adapter);

        TextInputEditText etSearch = view.findViewById(R.id.etSearch);
        etSearch.addTextChangedListener(new TextWatcher() {
            @Override public void beforeTextChanged(CharSequence s, int st, int c, int a) {}
            @Override public void onTextChanged(CharSequence s, int st, int b, int c) { load(s.toString()); }
            @Override public void afterTextChanged(Editable s) {}
        });

        FloatingActionButton fab = view.findViewById(R.id.fabAdd);
        String role = session.getUserRole();
        if ("admin".equals(role) || "agent".equals(role)) {
            fab.setOnClickListener(v -> showCreateDialog());
        } else {
            fab.setVisibility(View.GONE);
        }

        load("");
        return view;
    }

    private void load(String search) {
        api.getVisitors(search, new ApiManager.ArrayCallback() {
            @Override public void onSuccess(JSONArray r) { adapter.updateData(r); }
            @Override public void onError(String m) {}
        });
    }

    private void showCreateDialog() {
        LinearLayout layout = new LinearLayout(requireContext());
        layout.setOrientation(LinearLayout.VERTICAL); layout.setPadding(40, 20, 40, 20);

        EditText etName  = new EditText(requireContext()); etName.setHint("Nom complet");
        EditText etEmail = new EditText(requireContext()); etEmail.setHint("Email"); etEmail.setInputType(android.text.InputType.TYPE_TEXT_VARIATION_EMAIL_ADDRESS);
        EditText etPhone = new EditText(requireContext()); etPhone.setHint("Téléphone");
        EditText etDoc   = new EditText(requireContext()); etDoc.setHint("CIN / Passeport");
        EditText etPass  = new EditText(requireContext()); etPass.setHint("Mot de passe"); etPass.setInputType(android.text.InputType.TYPE_TEXT_VARIATION_PASSWORD);

        layout.addView(etName); layout.addView(etEmail);
        layout.addView(etPhone); layout.addView(etDoc); layout.addView(etPass);

        new AlertDialog.Builder(requireContext()).setTitle("Nouveau visiteur").setView(layout)
            .setPositiveButton("Créer", (d, w) -> {
                try {
                    JSONObject body = new JSONObject();
                    body.put("name", etName.getText().toString());
                    body.put("email", etEmail.getText().toString());
                    body.put("phone", etPhone.getText().toString());
                    body.put("id_document", etDoc.getText().toString());
                    body.put("password", etPass.getText().toString());
                    body.put("role", "visitor");
                    api.createVisitor(body, new ApiManager.ApiCallback() {
                        @Override public void onSuccess(JSONObject r) { load(""); toast("Visiteur créé"); }
                        @Override public void onError(String m)       { toast(m); }
                    });
                } catch (Exception e) { toast("Erreur"); }
            })
            .setNegativeButton("Annuler", null).show();
    }

    private void confirmDelete(int id) {
        new AlertDialog.Builder(requireContext()).setTitle("Confirmer")
            .setMessage("Supprimer ce visiteur ?")
            .setPositiveButton("Supprimer", (d, w) ->
                api.deleteVisitor(id, new ApiManager.ApiCallback() {
                    @Override public void onSuccess(JSONObject r) { load(""); toast("Supprimé"); }
                    @Override public void onError(String m)       { toast(m); }
                }))
            .setNegativeButton("Annuler", null).show();
    }

    private void toast(String msg) { Toast.makeText(requireContext(), msg, Toast.LENGTH_SHORT).show(); }
}
