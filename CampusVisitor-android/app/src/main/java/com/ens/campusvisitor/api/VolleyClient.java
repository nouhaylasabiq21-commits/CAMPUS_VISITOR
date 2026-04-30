package com.ens.campusvisitor.api;

import android.content.Context;
import com.android.volley.RequestQueue;
import com.android.volley.toolbox.Volley;

public class VolleyClient {
    private static VolleyClient instance;
    private RequestQueue requestQueue;

    // Emulateur Android → 10.0.2.2 = localhost de votre PC
    // Vrai telephone → mettez l'IP de votre PC ex: 192.168.1.X
    public static final String BASE_URL = "http://192.168.1.9:3000/";

    private VolleyClient(Context context) {
        requestQueue = Volley.newRequestQueue(context.getApplicationContext());
    }

    public static synchronized VolleyClient getInstance(Context context) {
        if (instance == null) instance = new VolleyClient(context);
        return instance;
    }

    public RequestQueue getRequestQueue() { return requestQueue; }
}
