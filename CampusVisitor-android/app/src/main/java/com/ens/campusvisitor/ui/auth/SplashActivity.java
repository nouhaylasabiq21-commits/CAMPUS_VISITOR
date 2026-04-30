package com.ens.campusvisitor.ui.auth;

import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;

import androidx.appcompat.app.AppCompatActivity;

import com.ens.campusvisitor.R;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.view.View;
public class SplashActivity extends AppCompatActivity {

    private static final int SPLASH_TIME = 3000;

    @Override
    protected void onCreate(Bundle savedInstanceState) {

        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_splash);
        View logo = findViewById(R.id.logo_wrapper);
        View title = findViewById(R.id.title);
        View subtitle = findViewById(R.id.subtitle_ens);
        View tagline = findViewById(R.id.tagline);

        Animation logoAnim = AnimationUtils.loadAnimation(this, R.anim.splash_logo_anim);
        Animation textAnim = AnimationUtils.loadAnimation(this, R.anim.splash_text_anim);

        logo.startAnimation(logoAnim);
        title.startAnimation(textAnim);
        subtitle.startAnimation(textAnim);
        tagline.startAnimation(textAnim);

        new Handler().postDelayed(() -> {
            Intent intent = new Intent(SplashActivity.this, LoginActivity.class);
            startActivity(intent);
            finish();
        }, SPLASH_TIME);
    }
}