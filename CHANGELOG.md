# Changelog

## v7: Lumen (28 October 2026)
- The launcher becomes its own app: **Lumen**, app ID `com.mkdziner.tvhome`, version 3.0, with its own icon and TV banner.
- Its own repository, [MinatoXmohith/lumen](https://github.com/MinatoXmohith/lumen), MIT with Gathin credited.

## v6: Wallpapers by mood and smoother motion (28 October 2026)
- Launcher settings → Wallpapers: Static and Live sections, five each, every one tagged with a mood
  (Calm, Fresh, Dreamy, Adventure, Moody · Nostalgic, Dreamy, Chill, Playful, Cozy).
- Your own images and videos load from the theme folder via `wallpapers.json` (`tools/wallpapers.sh`); a built-in set of
  five images and five animated scenes is the fallback.
- Live wallpapers are muted 1080p loops; they stop and free the video decoder whenever an app is open.
- The picked wallpaper previews full-screen behind the cards; an "In use" badge marks it.
- Motion: shared curves, spring focus on tiles and posters, menus fade out, launcher durations independent of the 0.5×
  system animation scale.

## v5: Home + weather (26 October 2026)
- New home from the Figma structure: greeting + date, HOME · APPS tabs, time + photo pill.
- Large now-playing card and a weather card with a details panel (feels like, UV index, wind, cloud cover, day / night).
- Five favourite apps; the APPS tab opens the full grid.
- Trending page sits below the home screen: Down slides it up, Up slides it back.
- mkdziner logo moved to the bottom right.
- Animations: APPS grows in from its tab and shrinks back on Home or Back, home settles in piece by piece,
  menus drop in from the time pill, and the trending page slides up already filled (prefetched and cached).

## v4: Dashboard (23 October 2026)
- New dashboard home from the Figma design: greeting, time + photo pill, glass rail, now-playing card,
  date & weather card, apps panel, Featured / Movies / Shows.
- Browse screens with this week's trending titles from TMDB, grouped by genre, plus a glass music bar.
- Live weather (Open-Meteo) for a city set in the theme.
- Clearer liquid glass: lighter blur, edge refraction, specular rim.
- Glenfinnan Viaduct wallpaper, with the mkdziner logo at the top centre.

## v3: Liquid glass (21–22 October 2026)
- Glass status pill, dock and menus; two-line greeting with name; profile photo.
- Control panel for Inputs, Wi-Fi and Settings.

## v2: Custom wallpaper (20 October 2026)
- Theme wallpaper with the mkdziner logo; animations at 0.5×; main apps pre-compiled.
- TCL Channel, MagiConnect and the Reminder app switched off.

## v1: Debloat + clean launcher (20 October 2026)
- Full backup, 9 telemetry / ad / promo apps disabled, CleanYourTV launcher installed as Home.
