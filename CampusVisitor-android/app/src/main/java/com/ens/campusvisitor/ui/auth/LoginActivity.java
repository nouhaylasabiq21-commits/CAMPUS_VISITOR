package com.ens.campusvisitor.ui.auth;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;

import androidx.appcompat.app.AppCompatActivity;

import com.ens.campusvisitor.R;
import com.ens.campusvisitor.api.ApiManager;
import com.ens.campusvisitor.MainActivity;
import com.ens.campusvisitor.utils.SessionManager;
import com.google.android.material.textfield.TextInputEditText;

import org.json.JSONObject;

public class LoginActivity extends AppCompatActivity {

    private TextInputEditText etEmail, etPassword;
    private TextView tvError;
    private Button btnLogin;

    private String selectedUserType = "agent";

    private ApiManager api;
    private SessionManager session;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_login);

        session = new SessionManager(this);
        api = new ApiManager(this);

        etEmail = findViewById(R.id.etEmail);
        etPassword = findViewById(R.id.etPassword);
        tvError = findViewById(R.id.tvError);
        btnLogin = findViewById(R.id.btnLogin);

        Button btnAgent = findViewById(R.id.btnAgent);
        Button btnHost = findViewById(R.id.btnHost);
        Button btnVisitor = findViewById(R.id.btnVisitor);

        View.OnClickListener typeClick = v -> {
            if (v == btnAgent) {
                selectedUserType = "agent";
            } else if (v == btnHost) {
                selectedUserType = "host";
            } else {
                selectedUserType = "visitor";
            }

            highlightSelected(btnAgent, btnHost, btnVisitor);
        };

        btnAgent.setOnClickListener(typeClick);
        btnHost.setOnClickListener(typeClick);
        btnVisitor.setOnClickListener(typeClick);

        highlightSelected(btnAgent, btnHost, btnVisitor);

        btnLogin.setOnClickListener(v -> doLogin());
    }

    private void highlightSelected(Button... btns) {
        String[] types = {"agent", "host", "visitor"};

        for (int i = 0; i < btns.length; i++) {
            if (types[i].equals(selectedUserType)) {
                btns[i].setBackgroundColor(getColor(R.color.accent_bg));
                btns[i].setTextColor(getColor(R.color.accent2));
            } else {
                btns[i].setBackgroundColor(getColor(R.color.surface));
                btns[i].setTextColor(getColor(R.color.text_muted));
            }
        }
    }

    private void doLogin() {
        String email = etEmail.getText().toString().trim();
        String password = etPassword.getText().toString().trim();

        if (email.isEmpty() || password.isEmpty()) {
            showError("Email et mot de passe obligatoires");
            return;
        }

        btnLogin.setEnabled(false);
        btnLogin.setText("Connexion...");
        tvError.setVisibility(View.GONE);

        api.login(email, password, selectedUserType, new ApiManager.ApiCallback() {
            @Override
            public void onSuccess(JSONObject response) {
                try {
                    String token = response.getString("token");
                    JSONObject user = response.getJSONObject("user");

                    session.saveSession(
                            token,
                            user.getInt("id"),
                            user.getString("name"),
                            user.getString("email"),
                            user.getString("role")
                    );

                    startActivity(new Intent(LoginActivity.this, MainActivity.class));
                    finish();

                } catch (Exception e) {
                    showError("Erreur de connexion");
                    btnLogin.setEnabled(true);
                    btnLogin.setText("Se connecter");
                }
            }

            @Override
            public void onError(String message) {
                showError(message);
                btnLogin.setEnabled(true);
                btnLogin.setText("Se connecter");
            }
        });
    }

    private void showError(String msg) {
        tvError.setText(msg);
        tvError.setVisibility(View.VISIBLE);
    }
}