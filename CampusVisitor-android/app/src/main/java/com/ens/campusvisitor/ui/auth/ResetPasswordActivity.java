package com.ens.campusvisitor.ui.auth;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import androidx.appcompat.app.AppCompatActivity;

import com.ens.campusvisitor.R;
import com.ens.campusvisitor.api.ApiManager;

import org.json.JSONObject;

public class ResetPasswordActivity extends AppCompatActivity {

    private EditText etNewPassword, etConfirmPassword;
    private TextView tvError;
    private Button btnReset;
    private ApiManager api;
    private String token = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_reset_password);

        api = new ApiManager(this);

        etNewPassword = findViewById(R.id.etNewPassword);
        etConfirmPassword = findViewById(R.id.etConfirmPassword);
        tvError = findViewById(R.id.tvError);
        btnReset = findViewById(R.id.btnReset);

        Uri data = getIntent().getData();
        if (data != null) {
            token = data.getQueryParameter("token");
        }

        if (token == null || token.isEmpty()) {
            showError("Lien invalide ou expiré");
            btnReset.setEnabled(false);
        }

        btnReset.setOnClickListener(v -> resetPassword());
    }

    private void resetPassword() {
        String password = etNewPassword.getText().toString().trim();
        String confirm = etConfirmPassword.getText().toString().trim();

        if (password.isEmpty() || confirm.isEmpty()) {
            showError("Veuillez remplir les deux champs");
            return;
        }

        if (!password.equals(confirm)) {
            showError("Les mots de passe ne correspondent pas");
            return;
        }

        btnReset.setEnabled(false);
        btnReset.setText("Réinitialisation...");

        api.resetPassword(token, password, new ApiManager.ApiCallback() {
            @Override
            public void onSuccess(JSONObject response) {
                Toast.makeText(ResetPasswordActivity.this,
                        "Mot de passe réinitialisé", Toast.LENGTH_LONG).show();

                Intent intent = new Intent(ResetPasswordActivity.this, LoginActivity.class);
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
                startActivity(intent);
            }

            @Override
            public void onError(String message) {
                showError(message);
                btnReset.setEnabled(true);
                btnReset.setText("Réinitialiser");
            }
        });
    }

    private void showError(String msg) {
        tvError.setText(msg);
        tvError.setVisibility(View.VISIBLE);
    }
}