# Security

This setup talks to a TV over ADB (Android Debug Bridge), which can run commands on the TV.
Please keep that in mind and report problems privately.

## Keeping your TV safe

- **Turn debugging off when you're done:** Developer options → USB debugging and Network debugging off →
  **Revoke USB debugging authorisations** → restart the TV. The home screen keeps working without it.
- Network ADB (port 5555) is unencrypted. Only use it on your own home Wi-Fi, and never open port 5555
  on your router.
- Never commit `tools/adbkey/`: it's the key your computer uses to control the TV. It's excluded by `.gitignore`.

## Reporting a problem

If something here could harm a TV or its owner (a step that can't be undone, a list that breaks a TV,
anything in the launcher fork that reaches the network or exposes data), please use GitHub's
**Security → Report a vulnerability** on this repository rather than a public issue.

For issues in the original CleanYourTV tools or launcher, see
[CleanYourTV's security policy](https://github.com/Gathin23/cleanyourtv/blob/main/SECURITY.md).
