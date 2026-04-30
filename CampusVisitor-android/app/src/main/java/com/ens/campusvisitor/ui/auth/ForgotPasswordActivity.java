package com.ens.campusvisitor.ui.auth;

import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.TextView;
import androidx.appcompat.app.AppCompatActivity;
import com.ens.campusvisitor.R;
import com.ens.campusvisitor.api.ApiManager;
import com.google.android.material.textfield.TextInputEditText;
import org.json.JSONObject;

public class ForgotPasswordActivity extends AppCompatActivity {

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_forgot_password);

        TextInputEditText etEmail = findViewById(R.id.etEmail);
        Button btnSend            = findViewById(R.id.btnSend);
        TextView tvMessage        = findViewById(R.id.tvMessage);
        ApiManager api            = new ApiManager(this);

        findViewById(R.id.btnBack).setOnClickListener(v -> finish());

        btnSend.setOnClickListener(v -> {
            String email = etEmail.getText().toString().trim();
            if (email.isEmpty()) return;

            btnSend.setEnabled(false);
            btnSend.setText("Envoi...");

            api.forgotPassword(email, new ApiManager.ApiCallback() {
                @Override public void onSuccess(JSONObject r) {
                    tvMessage.setText("Email envoyé ! Vérifiez votre boîte mail.");
                    tvMessage.setTextColor(getColor(R.color.green));
                    tvMessage.setVisibility(View.VISIBLE);
                    btnSend.setText("Envoyé ✓");
                }
                @Override public void onError(String m) {
                    tvMessage.setText(m);
                    tvMessage.setTextColor(getColor(R.color.accent));
                    tvMessage.setVisibility(View.VISIBLE);
                    btnSend.setEnabled(true);
                    btnSend.setText("Envoyer le lien");
                }
            });
        });
    }
}
