# TCL BeyondTV: what was changed and how to undo it

TV: TCL BeyondTV, Android TV 9, build PPR1.180610.011, IP <TV-IP> (changed 20 October 2026).
No firmware was flashed, nothing was rooted, and nothing was uninstalled.

## What was changed
1. 9 background apps were **disabled**. They're listed in `my-tv-debloat.txt`: TCL telemetry, promo feeds, demo stickers,
   cleaner widget, note reminder, TCL app store and Google recommendation rows.
2. The new launcher `com.gathin.tvhome` was installed and set as Home.
3. The old Google TV home screen `com.google.android.tvlauncher` was **disabled** (not deleted).

The full "before" snapshot is in `backup-20261020-1723/`. The undo record is in `~/.cleanyourtv/`.

## Undo everything (back to exactly how it was)
Turn **USB debugging** back on in the TV's Developer options. Then run this in Terminal:

```bash
cd ~/Desktop/TV-Demo && TV_HOST=<TV-IP> cleanyourtv/tools/restore.sh my-tv-debloat.txt
```

This turns the 9 apps and the old Google home screen back on, and makes the old one your Home again.
To also delete the new launcher, go to TV Settings → Apps → CleanYourTV → Uninstall.

## Undo without a laptop
TV Settings → Apps → See all apps → Show system apps → pick the app → **Enable**.
If you enable "Android TV Home" (com.google.android.tvlauncher), you'll be asked which Home to use when you press Home.

## Switch Home without undoing the debloat
On the new home screen, hold OK on **Settings** → Launcher settings → change default home.

## Speed tweaks (20 October 2026, 19:30)
- Animations were set to 0.5x (they were 1.0). To undo, turn on USB debugging and run:
  `cd ~/Desktop/TV-Demo/cleanyourtv && TV_HOST=<TV-IP> tools/venv/bin/python -I tools/tv.py 'settings put global window_animation_scale 1.0; settings put global transition_animation_scale 1.0; settings put global animator_duration_scale 1.0'`
  Or go to TV Settings → Developer options → Window / Transition / Animator animation scale and set each one to 1x.
- The main apps were pre-compiled ("speed" mode). This uses about 300 MB of storage and needs no undo. App updates replace it.

## Liquid glass + greeting name (21 October 2026)
- The launcher code was changed: `LiquidGlass.java` is new, and `DockDecoration.java` and `MainActivity.java` were edited.
  To go back to the original look: `cd ~/Desktop/TV-Demo/cleanyourtv && git checkout launcher/app/src/main/java && rm launcher/app/src/main/java/com/gathin/tvhome/LiquidGlass.java`,
  then reinstall with `cd launcher && TV_HOST=<TV-IP> ./build-and-install.sh` (your dock order in config.xml is kept).
- The greeting name is `"greeting_name"` in `my-theme/config.json`. Edit it there and push it with `cleanyourtv/tools/theme.sh ~/Desktop/TV-Demo/my-theme`.

## tvOS-style layout (22 October 2026)
- The time + avatar pill opens the Inputs / Wi-Fi / Settings panel. Hold OK on the pill (or on Settings in the panel) for the launcher's own settings.
- Code: `Avatar.java` and `res/font/outfit_semibold.xml` are new, and `activity_main.xml`, `MainActivity.java` and `LiquidGlass.java` were changed.
  To undo all launcher code changes, run `git checkout launcher/app/src/main` and `git clean -fd launcher/app/src/main` in `cleanyourtv/`, then reinstall.
- Layout settings are in `my-theme/config.json`: 5 columns, 1 row under the dock, no app title, Reminder and TCL TV tiles hidden.
- Profile photo: put a square photo at `my-theme/avatar.jpg`, push the theme, and the "MK" initials are replaced.
- The Reminder app (com.tcl.notereminder) is switched back on by TCL's own startup code after a restart. Its tile stays hidden anyway.

## Dashboard (23 October 2026)
- Home is now `com.gathin.tvhome/.DashboardActivity`. The old grid is still there as **All apps** (`MainActivity`).
- The launcher now uses the internet, only for weather (Open-Meteo) and posters (TMDB).
- Music access: the installer runs `cmd notification allow_listener com.gathin.tvhome/com.gathin.tvhome.MediaListener`.
  To revoke it, run `cmd notification disallow_listener com.gathin.tvhome/com.gathin.tvhome.MediaListener`.
- To go back to the v3 home screen: `cd cleanyourtv && git checkout 9df11ed -- launcher && cd launcher && TV_HOST=<TV-IP> ./build-and-install.sh`.
