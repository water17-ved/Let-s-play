# HOW TO GET JEE BATTLE ARENA ON YOUR PHONE (WITH THE WIDGET)
### A complete step-by-step guide — do the steps in order, don't skip any.

This turns your web app into a real installable Android app, WITH a home
screen widget that shows your boss's HP, streak, and tasks done — without
opening the app.

You do **not** need to know how to code. You just need to copy-paste some
commands and files exactly as shown. Budget about 45–60 minutes the first
time (mostly waiting for downloads/installs).

---

## WHAT YOU'RE GOING TO DO (big picture)

1. Install two free programs on your computer (Node.js, Android Studio)
2. Unzip your project folder
3. Run a few commands in a terminal (copy-paste, one at a time)
4. Drop in the widget files I already built for you
5. Press "Run" in Android Studio — the app installs on your phone
6. Long-press your home screen → add the widget

That's it. Steps 3–4 only need copy-pasting; you're not writing any code.

---

## STEP 1 — Install Node.js

Node.js lets your computer run the Capacitor tool that builds the app.

1. Go to **https://nodejs.org**
2. Download the version marked **LTS** (not "Current")
3. Open the downloaded file and click Next → Next → Install → Finish
   (default options are fine, just keep clicking Next)
4. To check it worked: open a terminal —
   - **Windows:** press the Windows key, type `cmd`, press Enter
   - **Mac:** press Cmd+Space, type `terminal`, press Enter
   and type:
   ```
   node -v
   ```
   If you see a version number like `v20.11.0`, it worked. If you see an
   error, restart your computer and try again.

---

## STEP 2 — Install Android Studio

This is the program that turns your web app into a real `.apk` file and
installs it on your phone. It also includes everything else needed
(Android SDK, build tools) — you don't need to install those separately.

1. Go to **https://developer.android.com/studio**
2. Download it and run the installer
3. Open Android Studio for the first time → click through the "Setup
   Wizard" with default options (this downloads more components — it can
   take 10–20 minutes, that's normal)
4. When it finishes, you'll see a "Welcome to Android Studio" window —
   leave it open, you'll come back to it in Step 6

---

## STEP 3 — Unzip your project

1. Find the `jee-battle-arena-final.zip` file I gave you earlier in this
   chat (scroll up to find it, or ask me to re-send it)
2. Unzip it anywhere easy to find, e.g. your Desktop
   - **Windows:** right-click the zip → "Extract All"
   - **Mac:** double-click the zip
3. You should now have a folder called `jee-battle-arena` with a `www`
   folder inside it, plus files like `package.json`

---

## STEP 4 — Open a terminal INSIDE that folder

This matters — every command below must run from inside the
`jee-battle-arena` folder, or it won't work.

- **Windows:** open the `jee-battle-arena` folder in File Explorer, click
  the address bar at the top, type `cmd`, press Enter — a terminal opens
  already inside the folder
- **Mac:** open Terminal, type `cd ` (with a space after cd), drag the
  `jee-battle-arena` folder from Finder into the terminal window, press
  Enter

---

## STEP 5 — Run these commands, one at a time

Copy-paste each line below into the terminal, press Enter, and **wait for
it to finish** before pasting the next one. The first one will take a few
minutes.

```
npm install
```
*(downloads everything the project needs — you'll see a lot of text
scroll by, that's normal)*

```
npx cap add android
```
*(this creates a new folder called `android` inside your project — this
is the actual native Android project)*

```
npx cap sync android
```
*(copies your web app files into the Android project)*

If any of these show a red "error" message, copy the exact text and ask
me — don't guess.

---

## STEP 6 — Add the widget files (copy-paste, no typing)

I already built the widget code for you, sitting in a folder called
`android-widget-files` inside your project. Now you just copy those files
into the right spots inside the new `android` folder Step 5 created.

**A. Copy the two Java files:**

Copy these two files:
```
android-widget-files/java/com/jeebattlearena/app/BossWidgetPlugin.java
android-widget-files/java/com/jeebattlearena/app/BossWidgetProvider.java
```
Into this folder (create the `app` folder if it's not already there —
it should already exist with `MainActivity.java` in it):
```
android/app/src/main/java/com/jeebattlearena/app/
```

**B. Copy the widget design files:**

Copy:
```
android-widget-files/res/layout/boss_widget.xml
```
into:
```
android/app/src/main/res/layout/
```

Copy:
```
android-widget-files/res/xml/boss_widget_info.xml
```
into:
```
android/app/src/main/res/xml/
```
*(if the `xml` folder doesn't exist inside `res`, just create a new
folder named `xml` there first)*

Copy:
```
android-widget-files/res/drawable/widget_background.xml
```
into:
```
android/app/src/main/res/drawable/
```

Copy:
```
android-widget-files/res/values/widget_strings.xml
```
into:
```
android/app/src/main/res/values/
```

**C. Edit two existing files (small copy-paste, not writing code):**

Open the file `android-widget-files/PASTE_INTO_EXISTING_FILES.txt` — it
has two clearly marked sections telling you exactly what to paste into:
- `android/app/src/main/AndroidManifest.xml`
- `android/app/src/main/java/com/jeebattlearena/app/MainActivity.java`

Follow it exactly — it shows you the "before" and "after" so you can't
get it wrong. Use Notepad, TextEdit, or (better) Android Studio itself to
open and edit these two files.

---

## STEP 7 — Open the project in Android Studio and run it

1. In Android Studio's welcome screen, click **Open**
2. Navigate to your `jee-battle-arena` folder → select the `android`
   folder inside it (NOT the outer jee-battle-arena folder) → Open
3. Wait — Android Studio will "sync" the project (progress bar at the
   bottom). This can take a few minutes the first time. Don't touch
   anything, just wait for it to finish.
4. Connect your Android phone to your computer with a USB cable
   - On your phone, you may get a popup asking to "Allow USB debugging" —
     tap **Allow**
   - If nothing happens, on your phone go to **Settings → About Phone**,
     tap **Build Number** 7 times (this unlocks Developer Options), then
     go to **Settings → Developer Options** and turn on **USB debugging**
5. In Android Studio, at the top you'll see your phone's name in a
   dropdown, and a green ▶ **Run** button next to it
6. Click the green ▶ **Run** button
7. Wait — it will build the app and install it directly on your phone.
   First time can take 3–5 minutes.
8. The app should now be open on your phone!

*(No phone handy? Android Studio can also create a virtual phone
"Emulator" to test on your computer — click the dropdown next to Run →
"Device Manager" → "Create Device" and follow the prompts.)*

---

## STEP 8 — Add the widget to your home screen

1. On your phone, use the app normally for a minute (complete a task or
   two) so it has real data to show
2. Go to your phone's home screen
3. **Long-press** on any empty space on the home screen
4. Tap **Widgets** (this option might be named slightly differently
   depending on your phone brand — look for a puzzle-piece icon)
5. Scroll down to find **JEE Battle Arena**
6. Drag its widget onto your home screen
7. It should show your boss name, HP%, streak, and tasks done

The widget updates instantly whenever you use the app, and also
refreshes automatically in the background every ~30 minutes (that's an
Android system limit, not something we can speed up).

---

## TROUBLESHOOTING

**"npm install" gives an error mentioning permissions**
→ Close the terminal, reopen it, make sure you're inside the
`jee-battle-arena` folder (Step 4), and try again.

**Android Studio says "SDK not found" or similar**
→ Go to File → Settings (or Android Studio → Preferences on Mac) →
Appearance & Behavior → System Settings → Android SDK, and make sure at
least one Android version has a checkmark. If none do, check one and
click Apply.

**My phone doesn't show up in the Run dropdown**
→ Try a different USB cable (some cables are charge-only, no data) →
make sure USB debugging is on (see Step 7) → try a different USB port.

**The widget doesn't appear in the Widgets list**
→ Double check every file in Step 6 landed in the exact folder listed —
a file in the wrong folder is the #1 cause of this. Also confirm you
edited both files in `PASTE_INTO_EXISTING_FILES.txt`, not just one.

**The widget shows up but says "100% HP" and never updates**
→ Open the app fully at least once on that phone (not just installed —
actually opened), complete or view a task so `renderBossHUD()` runs, then
check again.

**Anything else goes wrong**
→ Copy the exact error message (screenshot is fine) and send it to me —
don't try to guess a fix, just ask.

---

## AFTER THIS FIRST TIME

Every time you change something in the `www` folder (the actual app
code) and want it back on your phone, you only need to repeat:

```
npx cap sync android
```

then click the green ▶ Run button in Android Studio again. You do NOT
need to redo Steps 1, 2, 3, or 6 again — those were one-time setup.
