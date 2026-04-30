package com.ens.campusvisitor.ui.visits;

import android.content.Context;
import android.view.*;
import android.widget.*;

import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;

import com.ens.campusvisitor.R;
import com.ens.campusvisitor.utils.SessionManager;

import org.json.JSONArray;
import org.json.JSONObject;

public class VisitAdapter extends RecyclerView.Adapter<VisitAdapter.ViewHolder> {

    private JSONArray data;
    private Context context;
    private ActionListener listener;
    private String userRole;

    public interface ActionListener {
        void onApprove(int id);
        void onRefuse(int id);
        void onCheckIn(int id);
        void onCheckOut(int id);
    }

    public VisitAdapter(JSONArray data, Context context, ActionListener listener) {
        this.data = data;
        this.context = context;
        this.listener = listener;
        this.userRole = new SessionManager(context).getUserRole();
    }

    @NonNull
    @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(context).inflate(R.layout.item_visit, parent, false);
        return new ViewHolder(v);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder h, int pos) {
        try {
            JSONObject v = data.getJSONObject(pos);
            String status = v.optString("status", "");

            h.tvVisitorName.setText(v.optString("visitor_name", "—"));
            h.tvVisitorEmail.setText(v.optString("visitor_email", ""));
            h.tvHostName.setText("→ " + v.optString("host_name", "—") + " (" + v.optString("department", "") + ")");

            String dt = v.optString("scheduled_at", "");
            h.tvScheduled.setText(dt.length() >= 16 ? dt.substring(0, 16).replace("T", " ") : dt);

            h.tvStatus.setText(getStatusLabel(status));

            int[] colors = getStatusColors(status);
            h.tvStatus.setBackgroundColor(colors[0]);
            h.tvStatus.setTextColor(colors[1]);

            h.llActions.removeAllViews();

            if (listener != null) {
                int id = v.getInt("id");

                boolean canApprove = "host".equals(userRole);
                boolean canCheckIn = "agent".equals(userRole);
                boolean canCheckOut = "host".equals(userRole);

                if (canApprove && "pending".equals(status)) {
                    Button btnApprove = makeBtn(
                            "Approuver",
                            context.getColor(R.color.green),
                            context.getColor(android.R.color.white)
                    );
                    btnApprove.setOnClickListener(vv -> listener.onApprove(id));
                    h.llActions.addView(btnApprove);

                    Button btnRefuse = makeBtn(
                            "Refuser",
                            context.getColor(R.color.accent_red),
                            context.getColor(android.R.color.white)
                    );
                    btnRefuse.setOnClickListener(vv -> listener.onRefuse(id));
                    h.llActions.addView(btnRefuse);
                }

                if (canCheckIn && "approved".equals(status)) {
                    Button btnCheckIn = makeBtn(
                            "Check-in",
                            context.getColor(R.color.accent),
                            context.getColor(android.R.color.white)
                    );
                    btnCheckIn.setOnClickListener(vv -> listener.onCheckIn(id));
                    h.llActions.addView(btnCheckIn);
                }

                if (canCheckOut && "ongoing".equals(status)) {
                    Button btnCheckOut = makeBtn(
                            "Check-out",
                            context.getColor(R.color.accent),
                            context.getColor(android.R.color.white)
                    );
                    btnCheckOut.setOnClickListener(vv -> listener.onCheckOut(id));
                    h.llActions.addView(btnCheckOut);
                }
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private Button makeBtn(String text, int bg, int fg) {
        Button btn = new Button(context);

        btn.setText(text);
        btn.setTextSize(10f);
        btn.setTextColor(fg);
        btn.setAllCaps(false);
        btn.setBackgroundColor(bg);

        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(
                LinearLayout.LayoutParams.WRAP_CONTENT,
                44
        );

        p.setMargins(6, 0, 0, 0);
        btn.setLayoutParams(p);
        btn.setPadding(18, 4, 18, 4);

        return btn;
    }

    private String getStatusLabel(String s) {
        switch (s) {
            case "pending":
                return "En attente";
            case "approved":
                return "Approuvée";
            case "ongoing":
                return "En cours";
            case "completed":
                return "Terminée";
            case "refused":
                return "Refusée";
            case "cancelled":
                return "Annulée";
            default:
                return s;
        }
    }

    private int[] getStatusColors(String s) {
        switch (s) {
            case "pending":
                return new int[]{
                        context.getColor(R.color.gold_bg),
                        context.getColor(R.color.gold)
                };

            case "approved":
                return new int[]{
                        context.getColor(R.color.green_bg),
                        context.getColor(R.color.green)
                };

            case "ongoing":
                return new int[]{
                        context.getColor(R.color.accent_bg),
                        context.getColor(R.color.accent)
                };

            case "completed":
                return new int[]{
                        context.getColor(R.color.surface2),
                        context.getColor(R.color.text_muted)
                };

            case "refused":
            case "cancelled":
                return new int[]{
                        context.getColor(R.color.accent_red_bg),
                        context.getColor(R.color.accent_red)
                };

            default:
                return new int[]{
                        context.getColor(R.color.surface2),
                        context.getColor(R.color.text_muted)
                };
        }
    }

    @Override
    public int getItemCount() {
        return data.length();
    }

    public void updateData(JSONArray d) {
        this.data = d;
        notifyDataSetChanged();
    }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvVisitorName, tvVisitorEmail, tvHostName, tvScheduled, tvStatus;
        LinearLayout llActions;

        ViewHolder(View v) {
            super(v);
            tvVisitorName = v.findViewById(R.id.tvVisitorName);
            tvVisitorEmail = v.findViewById(R.id.tvVisitorEmail);
            tvHostName = v.findViewById(R.id.tvHostName);
            tvScheduled = v.findViewById(R.id.tvScheduled);
            tvStatus = v.findViewById(R.id.tvStatus);
            llActions = v.findViewById(R.id.llActions);
        }
    }
}