
The default interactive shell is now zsh.
To update your account to use zsh, please run `chsh -s /bin/zsh`.
For more details, please visit https://support.apple.com/kb/HT208050.
Machines-MacBook-Pro:Atlanticproxy machine$ cd atlantic-dashboard
Machines-MacBook-Pro:atlantic-dashboard machine$ npm run dev
# Visit http://localhost:3456

> atlantic-dashboard@0.1.0 dev
> next dev

⚠ Port 3000 is in use by an unknown process, using available port 3001 instead.
▲ Next.js 16.1.1 (Turbopack)
- Local:         http://localhost:3001
- Network:       http://192.168.0.153:3001
- Environments: .env.local

✓ Starting...
⨯ Unable to acquire lock at /Users/machine/My Drive/Github Projects/Atlanticproxy/atlantic-dashboard/.next/dev/lock, is another instance of next dev running?
  Suggestion: If you intended to restart next dev, terminate the other process, and then try again.

Machines-MacBook-Pro:atlantic-dashboard machine$ # Visit http://localhost:3456
Machines-MacBook-Pro:atlantic-dashboard machine$ 