package com.ens.campusvisitor.ui.visitors;

import android.content.Context;
import android.view.*;
import android.widget.*;
import androidx.annotation.NonNull;
import androidx.recyclerview.widget.RecyclerView;
import com.ens.campusvisitor.R;
import org.json.JSONArray;
import org.json.JSONObject;

public class PersonAdapter extends RecyclerView.Adapter<PersonAdapter.ViewHolder> {

    private JSONArray data;
    private Context context;
    private String type;
    private String userRole;
    private OnDeleteListener deleteListener;

    public interface OnDeleteListener { void onDelete(int id); }

    public PersonAdapter(JSONArray data, Context ctx, String type, String userRole, OnDeleteListener listener) {
        this.data = data; this.context = ctx; this.type = type;
        this.userRole = userRole; this.deleteListener = listener;
    }

    @NonNull @Override
    public ViewHolder onCreateViewHolder(@NonNull ViewGroup parent, int viewType) {
        View v = LayoutInflater.from(context).inflate(R.layout.item_person, parent, false);
        return new ViewHolder(v);
    }

    @Override
    public void onBindViewHolder(@NonNull ViewHolder h, int pos) {
        try {
            JSONObject item = data.getJSONObject(pos);
            String name = item.optString("name", "");
            h.tvName.setText(name);
            h.tvEmail.setText(item.optString("email", ""));
            h.tvAvatar.setText(name.length() > 0 ? String.valueOf(name.charAt(0)).toUpperCase() : "?");
            h.tvSub.setText("host".equals(type) ? item.optString("department", "—") : item.optString("phone", "—"));
            h.tvRole.setText(item.optString("role", ""));
            h.tvRole.setBackgroundColor(context.getColor(R.color.surface2));
            h.tvRole.setTextColor(context.getColor(R.color.text_muted));

            if ("admin".equals(userRole)) {
                h.btnDelete.setVisibility(View.VISIBLE);
                int id = item.getInt("id");
                h.btnDelete.setOnClickListener(v -> deleteListener.onDelete(id));
            } else {
                h.btnDelete.setVisibility(View.GONE);
            }
        } catch (Exception e) { e.printStackTrace(); }
    }

    @Override public int getItemCount() { return data.length(); }
    public void updateData(JSONArray d) { this.data = d; notifyDataSetChanged(); }

    static class ViewHolder extends RecyclerView.ViewHolder {
        TextView tvAvatar, tvName, tvEmail, tvSub, tvRole;
        ImageButton btnDelete;
        ViewHolder(View v) {
            super(v);
            tvAvatar  = v.findViewById(R.id.tvAvatar);
            tvName    = v.findViewById(R.id.tvName);
            tvEmail   = v.findViewById(R.id.tvEmail);
            tvSub     = v.findViewById(R.id.tvSub);
            tvRole    = v.findViewById(R.id.tvRole);
            btnDelete = v.findViewById(R.id.btnDelete);
        }
    }
}
