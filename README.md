# Google TV — Ad-Free Home Screen & Modern UI

TCL BeyondTV (India), Android TV 9, IP 192.168.1.36. It was cleaned up with
[CleanYourTV](https://github.com/Gathin23/cleanyourtv) and given a tvOS-style home screen.

| Path | What it is |
|---|---|
| `HOW-TO-RESTORE.md` | What was changed on the TV, and how to undo each part |
| `my-tv-debloat.txt` | The apps that were disabled (apply or restore it with the cleanyourtv tools) |
| `my-theme/` | The theme on the TV: `config.json` (layout, greeting name, hidden apps), `wallpaper.jpg`, `avatar.jpg` |
| `backup-20261020-1723/` | Snapshot of the TV before any change: packages, settings, properties |
| `wallpaper-*.jpg`, `spiderman-original.jpg`, `mkdziner-logo.webp` | Wallpaper sources and versions |
| `*.png` | Screenshots taken from the TV during the setup |
| `cleanyourtv/` | The launcher and tools. This is a separate git repository, not tracked here. Your changes are on branch `my-tv-setup` |

Push the theme again after editing it:

    cd cleanyourtv && TV_HOST=192.168.1.36 tools/theme.sh ~/Desktop/TV-Demo/my-theme
