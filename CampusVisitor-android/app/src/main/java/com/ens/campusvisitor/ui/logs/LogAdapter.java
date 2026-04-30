package com.ens.campusvisitor.ui.logs;

import android.content.Context;
import android.view.*;
import android.widget.TextView;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.ens.campusvisitor.R;
import org.json.JSONArray;
import org.json.JSONObject;

public class LogAdapter extends RecyclerView.Adapter<LogAdapter.ViewHolder> {

    private JSONArray data;
    private Context context;

    public LogAdapter(JSONArray data, Context context) {
        this.data = data; this.context = context;
    }

    @NonNull @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(context).inflate(R.layout.item_log, parent, false);
        return new ViewHolder(v);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder h, int pos) {
        try {
            JSONObject log  = data.getJSONObject(pos);
            String eventType = log.optString("event_type", "");

            if ("CHECK_IN".equals(eventType)) {
                h.tvEventType.setText("↓ Entrée");
                h.tvEventType.setBackgroundColor(context.getColor(R.color.blue_bg));
                h.tvEventType.setTextColor(context.getColor(R.color.blue));
            } else {
                h.tvEventType.setText("↑ Sortie");
                h.tvEventType.setBackgroundColor(context.getColor(R.color.green_bg));
                h.tvEventType.setTextColor(context.getColor(R.color.green));
            }

            h.tvVisitorName.setText(log.optString("visitor_name", "—"));
            h.tvHostName.setText(log.optString("host_name", "—"));

            String ts = log.optString("timestamp", "");
            if (ts.length() >= 16) ts = ts.substring(0, 16).replace("T", " ");
            h.tvTimestamp.setText(ts);
        } catch (Exception e) { e.printStackTrace(); }
    }

    @Override public int getItemCount() { return data.length(); }
    public void updateData(JSONArray d) { this.data = d; notifyDataSetChanged(); }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvEventType, tvVisitorName, tvHostName, tvTimestamp;
        ViewHolder(View v) {
            super(v);
            tvEventType   = v.findViewById(R.id.tvEventType);
            tvVisitorName = v.findViewById(R.id.tvVisitorName);
            tvHostName    = v.findViewById(R.id.tvHostName);
            tvTimestamp   = v.findViewById(R.id.tvTimestamp);
        }
    }
}
