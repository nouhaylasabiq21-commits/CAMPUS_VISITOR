package com.ens.campusvisitor.api;

import android.content.Context;
import com.android.volley.Request;
import com.android.volley.toolbox.JsonArrayRequest;
import com.android.volley.toolbox.JsonObjectRequest;
import com.android.volley.toolbox.StringRequest;
import com.ens.campusvisitor.utils.SessionManager;
import org.json.JSONArray;
import org.json.JSONObject;
import java.util.HashMap;
import java.util.Map;

public class ApiManager {
    private Context context;
    private SessionManager session;

    public interface ApiCallback {
        void onSuccess(JSONObject response);
        void onError(String message);
    }

    public interface ArrayCallback {
        void onSuccess(JSONArray response);
        void onError(String message);
    }

    public ApiManager(Context context) {
        this.context = context;
        this.session = new SessionManager(context);
    }

    private String auth() { return "Bearer " + session.getToken(); }

    private String parseError(com.android.volley.VolleyError error) {
        try {
            String body = new String(error.networkResponse.data);
            JSONObject obj = new JSONObject(body);
            return obj.getString("message");
        } catch (Exception e) { return "Erreur réseau"; }
    }

    // ── AUTH ────────────────────────────────────────────────────────────────

    public void login(String email, String password, String userType, ApiCallback cb) {
        String url = VolleyClient.BASE_URL + "api/auth/login";
        try {
            JSONObject body = new JSONObject();
            body.put("email", email);
            body.put("password", password);
            body.put("userType", userType);
            JsonObjectRequest req = new JsonObjectRequest(Request.Method.POST, url, body,
                cb::onSuccess, e -> cb.onError(parseError(e)));
            VolleyClient.getInstance(context).getRequestQueue().add(req);
        } catch (Exception e) { cb.onError(e.getMessage()); }
    }

    public void forgotPassword(String email, ApiCallback cb) {
        String url = VolleyClient.BASE_URL + "api/auth/forgot-password";
        try {
            JSONObject body = new JSONObject();
            body.put("email", email);
            JsonObjectRequest req = new JsonObjectRequest(Request.Method.POST, url, body,
                cb::onSuccess, e -> cb.onError(parseError(e)));
            VolleyClient.getInstance(context).getRequestQueue().add(req);
        } catch (Exception e) { cb.onError(e.getMessage()); }
    }

    // ── DASHBOARD ───────────────────────────────────────────────────────────

    public void getDashboardStats(ApiCallback cb) {
        String url = VolleyClient.BASE_URL + "api/visits/dashboard/stats";
        JsonObjectRequest req = new JsonObjectRequest(Request.Method.GET, url, null,
            cb::onSuccess, e -> cb.onError(parseError(e))) {
            @Override public Map<String, String> getHeaders() {
                Map<String, String> h = new HashMap<>(); h.put("Authorization", auth()); return h;
            }
        };
        VolleyClient.getInstance(context).getRequestQueue().add(req);
    }

    // ── VISITS ──────────────────────────────────────────────────────────────

    public void getVisits(String status, ArrayCallback cb) {
        String url = VolleyClient.BASE_URL + "api/visits";
        if (status != null && !status.isEmpty()) url += "?status=" + status;
        JsonArrayRequest req = new JsonArrayRequest(Request.Method.GET, url, null,
            cb::onSuccess, e -> cb.onError(parseError(e))) {
            @Override public Map<String, String> getHeaders() {
                Map<String, String> h = new HashMap<>(); h.put("Authorization", auth()); return h;
            }
        };
        VolleyClient.getInstance(context).getRequestQueue().add(req);
    }

    public void createVisit(JSONObject body, ApiCallback cb) {
        String url = VolleyClient.BASE_URL + "api/visits";
        JsonObjectRequest req = new JsonObjectRequest(Request.Method.POST, url, body,
            cb::onSuccess, e -> cb.onError(parseError(e))) {
            @Override public Map<String, String> getHeaders() {
                Map<String, String> h = new HashMap<>(); h.put("Authorization", auth()); return h;
            }
        };
        VolleyClient.getInstance(context).getRequestQueue().add(req);
    }

    public void updateVisitStatus(int id, String status, ApiCallback cb) {
        String url = VolleyClient.BASE_URL + "api/visits/" + id + "/status";
        try {
            JSONObject body = new JSONObject(); body.put("status", status);
            JsonObjectRequest req = new JsonObjectRequest(Request.Method.PATCH, url, body,
                cb::onSuccess, e -> cb.onError(parseError(e))) {
                @Override public Map<String, String> getHeaders() {
                    Map<String, String> h = new HashMap<>(); h.put("Authorization", auth()); return h;
                }
            };
            VolleyClient.getInstance(context).getRequestQueue().add(req);
        } catch (Exception e) { cb.onError(e.getMessage()); }
    }

    public void checkIn(int id, ApiCallback cb) {
        String url = VolleyClient.BASE_URL + "api/visits/" + id + "/check-in";
        try {
            JSONObject body = new JSONObject(); body.put("agent_id", session.getUserId());
            JsonObjectRequest req = new JsonObjectRequest(Request.Method.POST, url, body,
                cb::onSuccess, e -> cb.onError(parseError(e))) {
                @Override public Map<String, String> getHeaders() {
                    Map<String, String> h = new HashMap<>(); h.put("Authorization", auth()); return h;
                }
            };
            VolleyClient.getInstance(context).getRequestQueue().add(req);
        } catch (Exception e) { cb.onError(e.getMessage()); }
    }

    public void checkOut(int id, ApiCallback cb) {
        String url = VolleyClient.BASE_URL + "api/visits/" + id + "/check-out";
        try {
            JSONObject body = new JSONObject(); body.put("agent_id", session.getUserId());
            JsonObjectRequest req = new JsonObjectRequest(Request.Method.POST, url, body,
                cb::onSuccess, e -> cb.onError(parseError(e))) {
                @Override public Map<String, String> getHeaders() {
                    Map<String, String> h = new HashMap<>(); h.put("Authorization", auth()); return h;
                }
            };
            VolleyClient.getInstance(context).getRequestQueue().add(req);
        } catch (Exception e) { cb.onError(e.getMessage()); }
    }

    // ── VISITORS ────────────────────────────────────────────────────────────

    public void getVisitors(String search, ArrayCallback cb) {
        String url = VolleyClient.BASE_URL + "api/visitors";
        if (search != null && !search.isEmpty()) url += "?search=" + search;
        JsonArrayRequest req = new JsonArrayRequest(Request.Method.GET, url, null,
            cb::onSuccess, e -> cb.onError(parseError(e))) {
            @Override public Map<String, String> getHeaders() {
                Map<String, String> h = new HashMap<>(); h.put("Authorization", auth()); return h;
            }
        };
        VolleyClient.getInstance(context).getRequestQueue().add(req);
    }

    public void createVisitor(JSONObject body, ApiCallback cb) {
        String url = VolleyClient.BASE_URL + "api/visitors";
        JsonObjectRequest req = new JsonObjectRequest(Request.Method.POST, url, body,
            cb::onSuccess, e -> cb.onError(parseError(e))) {
            @Override public Map<String, String> getHeaders() {
                Map<String, String> h = new HashMap<>(); h.put("Authorization", auth()); return h;
            }
        };
        VolleyClient.getInstance(context).getRequestQueue().add(req);
    }

    public void deleteVisitor(int id, ApiCallback cb) {
        String url = VolleyClient.BASE_URL + "api/visitors/" + id;
        StringRequest req = new StringRequest(Request.Method.DELETE, url,
            r -> cb.onSuccess(new JSONObject()), e -> cb.onError(parseError(e))) {
            @Override public Map<String, String> getHeaders() {
                Map<String, String> h = new HashMap<>(); h.put("Authorization", auth()); return h;
            }
        };
        VolleyClient.getInstance(context).getRequestQueue().add(req);
    }

    // ── HOSTS ───────────────────────────────────────────────────────────────

    public void getHosts(String search, ArrayCallback cb) {
        String url = VolleyClient.BASE_URL + "api/hosts";
        if (search != null && !search.isEmpty()) url += "?search=" + search;
        JsonArrayRequest req = new JsonArrayRequest(Request.Method.GET, url, null,
            cb::onSuccess, e -> cb.onError(parseError(e))) {
            @Override public Map<String, String> getHeaders() {
                Map<String, String> h = new HashMap<>(); h.put("Authorization", auth()); return h;
            }
        };
        VolleyClient.getInstance(context).getRequestQueue().add(req);
    }

    public void createHost(JSONObject body, ApiCallback cb) {
        String url = VolleyClient.BASE_URL + "api/hosts";
        JsonObjectRequest req = new JsonObjectRequest(Request.Method.POST, url, body,
            cb::onSuccess, e -> cb.onError(parseError(e))) {
            @Override public Map<String, String> getHeaders() {
                Map<String, String> h = new HashMap<>(); h.put("Authorization", auth()); return h;
            }
        };
        VolleyClient.getInstance(context).getRequestQueue().add(req);
    }

    public void deleteHost(int id, ApiCallback cb) {
        String url = VolleyClient.BASE_URL + "api/hosts/" + id;
        StringRequest req = new StringRequest(Request.Method.DELETE, url,
            r -> cb.onSuccess(new JSONObject()), e -> cb.onError(parseError(e))) {
            @Override public Map<String, String> getHeaders() {
                Map<String, String> h = new HashMap<>(); h.put("Authorization", auth()); return h;
            }
        };
        VolleyClient.getInstance(context).getRequestQueue().add(req);
    }

    // ── LOGS ────────────────────────────────────────────────────────────────

    public void getLogs(ArrayCallback cb) {
        String url = VolleyClient.BASE_URL + "api/logs";
        JsonArrayRequest req = new JsonArrayRequest(Request.Method.GET, url, null,
            cb::onSuccess, e -> cb.onError(parseError(e))) {
            @Override public Map<String, String> getHeaders() {
                Map<String, String> h = new HashMap<>(); h.put("Authorization", auth()); return h;
            }
        };
        VolleyClient.getInstance(context).getRequestQueue().add(req);
    }
    public void resetPassword(String token, String password, ApiCallback cb) {
        String url = VolleyClient.BASE_URL + "api/auth/reset-password";

        try {
            JSONObject body = new JSONObject();
            body.put("token", token);
            body.put("password", password);

            JsonObjectRequest req = new JsonObjectRequest(
                    Request.Method.POST,
                    url,
                    body,
                    cb::onSuccess,
                    e -> cb.onError(parseError(e))
            );

            VolleyClient.getInstance(context).getRequestQueue().add(req);

        } catch (Exception e) {
            cb.onError(e.getMessage());
        }
    }
}
