# Contributing

Thanks for wanting to help. This repo documents one TV setup, so the most useful contributions are:

- **Your own TV.** If you used this on another Google TV or Android TV, open an issue with your model,
  Android version and the list of packages you switched off, and whether anything broke. Lists for many
  more models live in [CleanYourTV's `examples/`](https://github.com/Gathin23/cleanyourtv/tree/main/examples),
  and adding yours there helps the most people.
- **Fixes to the guide.** If a step in the README or [HOW-TO-RESTORE.md](HOW-TO-RESTORE.md) was wrong or
  unclear for you, send a pull request.
- **Launcher changes** (liquid glass, status pill, control panel) belong in the
  [`my-tv-setup` branch of the launcher fork](https://github.com/MinatoXmohith/cleanyourtv/tree/my-tv-setup).

## Rules for debloat lists

- Use `pm disable-user`, never uninstall system packages.
- Never switch off what the TV needs: the Live TV / HDMI app, input services, remote and Bluetooth
  services, the on-screen keyboard, the Play Store and Play Services.
- Don't commit your TV's backup dumps unless you're happy for its serial number and device ID to be public.

## Pull requests

Keep them small and say which TV you tested on. By contributing you agree your contribution is
released under the [MIT licence](LICENSE). Artwork and photos are excluded, as the licence explains.
