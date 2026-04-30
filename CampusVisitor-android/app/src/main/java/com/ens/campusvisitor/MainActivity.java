package com.ens.campusvisitor;

import android.content.Intent;
import android.os.Bundle;

import androidx.appcompat.app.AppCompatActivity;
import androidx.navigation.NavController;
import androidx.navigation.fragment.NavHostFragment;
import androidx.navigation.ui.NavigationUI;

import com.ens.campusvisitor.ui.auth.LoginActivity;
import com.ens.campusvisitor.utils.SessionManager;
import com.google.android.material.bottomnavigation.BottomNavigationView;

public class MainActivity extends AppCompatActivity {

    private SessionManager session;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        session = new SessionManager(this);

        if (!session.isLoggedIn()) {
            startActivity(new Intent(this, LoginActivity.class));
            finish();
            return;
        }

        setContentView(R.layout.activity_main);

        NavHostFragment navHost = (NavHostFragment)
                getSupportFragmentManager().findFragmentById(R.id.nav_host_fragment);

        NavController navController = navHost.getNavController();
        BottomNavigationView bottomNav = findViewById(R.id.bottomNav);

        String role = session.getUserRole();

        if ("agent".equals(role)) {
            bottomNav.getMenu().removeItem(R.id.visitorsFragment);
            bottomNav.getMenu().removeItem(R.id.hostsFragment);
        } else if ("host".equals(role)) {
            bottomNav.getMenu().removeItem(R.id.visitorsFragment);
            bottomNav.getMenu().removeItem(R.id.hostsFragment);
        } else if ("visitor".equals(role)) {
            bottomNav.getMenu().removeItem(R.id.visitorsFragment);
            bottomNav.getMenu().removeItem(R.id.hostsFragment);
            bottomNav.getMenu().removeItem(R.id.checkInFragment);
        }

        NavigationUI.setupWithNavController(bottomNav, navController);
    }

    public void logout() {
        session.clearSession();

        Intent intent = new Intent(MainActivity.this, LoginActivity.class);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TASK);
        startActivity(intent);
    }
}