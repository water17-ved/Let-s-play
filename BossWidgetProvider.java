package com.jeebattlearena.app;

import android.app.PendingIntent;
import android.appwidget.AppWidgetManager;
import android.appwidget.AppWidgetProvider;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Build;
import android.widget.RemoteViews;

public class BossWidgetProvider extends AppWidgetProvider {

    @Override
    public void onUpdate(Context context, AppWidgetManager appWidgetManager, int[] appWidgetIds) {
        for (int appWidgetId : appWidgetIds) {
            updateWidget(context, appWidgetManager, appWidgetId);
        }
    }

    private void updateWidget(Context context, AppWidgetManager appWidgetManager, int appWidgetId) {
        SharedPreferences prefs =
                context.getSharedPreferences(BossWidgetPlugin.PREFS_NAME, Context.MODE_PRIVATE);

        String bossName = prefs.getString("boss_name", "DAILY BOSS");
        int hp           = prefs.getInt("boss_hp", 100);
        int streak       = prefs.getInt("boss_streak", 0);
        int tasksDone    = prefs.getInt("boss_tasks_done", 0);
        int tasksTotal   = prefs.getInt("boss_tasks_total", 0);

        RemoteViews views = new RemoteViews(context.getPackageName(), R.layout.boss_widget);
        views.setTextViewText(R.id.widget_boss_name, bossName);
        views.setTextViewText(R.id.widget_hp_text, hp + "% HP");
        views.setProgressBar(R.id.widget_hp_bar, 100, hp, false);
        views.setTextViewText(R.id.widget_streak_text, "\uD83D\uDD25 " + streak + "-day streak");
        views.setTextViewText(R.id.widget_tasks_text, tasksDone + "/" + tasksTotal + " tasks done");

        // Tapping the widget opens the app
        Intent launchIntent = context.getPackageManager().getLaunchIntentForPackage(context.getPackageName());
        int flags = Build.VERSION.SDK_INT >= Build.VERSION_CODES.S ? PendingIntent.FLAG_IMMUTABLE : 0;
        PendingIntent pendingIntent = PendingIntent.getActivity(context, 0, launchIntent, flags);
        views.setOnClickPendingIntent(R.id.widget_root, pendingIntent);

        appWidgetManager.updateAppWidget(appWidgetId, views);
    }
}
