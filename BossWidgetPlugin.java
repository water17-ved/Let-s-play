package com.jeebattlearena.app;

import android.appwidget.AppWidgetManager;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;

import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

// This class lets the web app (app.js) send boss data into Android so the
// home-screen widget (BossWidgetProvider) can display it.
// DO NOT rename the string "BossWidget" below — app.js looks for this exact name.
@CapacitorPlugin(name = "BossWidget")
public class BossWidgetPlugin extends Plugin {

    public static final String PREFS_NAME = "boss_widget_prefs";

    @PluginMethod
    public void pushData(PluginCall call) {
        Context context = getContext();
        SharedPreferences.Editor editor =
                context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE).edit();

        editor.putString("boss_name", call.getString("bossName", "DAILY BOSS"));
        editor.putInt("boss_hp", call.getInt("hp", 100));
        editor.putInt("boss_streak", call.getInt("streak", 0));
        editor.putInt("boss_tasks_done", call.getInt("tasksDone", 0));
        editor.putInt("boss_tasks_total", call.getInt("tasksTotal", 0));
        editor.apply();

        // Ask Android to redraw every JEE Battle Arena widget right now,
        // instead of waiting for the ~30 minute automatic refresh.
        Intent intent = new Intent(context, BossWidgetProvider.class);
        intent.setAction(AppWidgetManager.ACTION_APPWIDGET_UPDATE);
        int[] ids = AppWidgetManager.getInstance(context.getApplicationContext())
                .getAppWidgetIds(new ComponentName(context.getApplicationContext(), BossWidgetProvider.class));
        intent.putExtra(AppWidgetManager.EXTRA_APPWIDGET_IDS, ids);
        context.sendBroadcast(intent);

        JSObject ret = new JSObject();
        ret.put("success", true);
        call.resolve(ret);
    }
}
