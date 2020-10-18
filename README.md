# CAH-Box

Cards Against Humanity mixed with the play-on-any-device strategy of JackBox
games. Yuh know, cuz of COVID, and I wanted to play around with Svelte.

https://cahbox.herokuapp.com/

---

## Development

1. Install `npm i`
1. Run `npm run dev`

### Logging

The App utilizes [debug](https://www.npmjs.com/package/debug) and Server logs
are always enabled, but Client logs are only enabled in Development and if
`verbose` logs are enabled (the latter is a quirk of `debug` not my choosing).
When on the Client I tend to just filter by `cahbox` since the `verbose` logs
can be noisy.

---

## Deploy to Heroku

In more complicated use cases, you may need to create a `Procfile`. For this
App, there's already a `build` and `start` script in `package.json` and that's
all that Heroku needs.

1. [Create an account on Heroku](https://signup.heroku.com/) if you don't
   already have one.
1. Once logged in, [go to your Apps Dashboard](https://dashboard.heroku.com/apps).
   - Click on the **Create new app** button
   - Give it a name, and click **Create**
   - After creating, you should be in the App / Deploy section.
      - **Deployment Method**:
         - Click on **Connect to GitHub**
         - Allow Heroku to connect
         - Search for your repo, click **Connect**
      - **Automatic Deploys**:
         - Choose what branch you want deployed
         - If you have CI enabled on your branch, check **Wait for CI to pass
           before deploy**.
         - Once your code is in a reliable state, click the **Enable Automatic
           Deploys** button.
      - **Manual Deploy**:
         - Make sure the proper branch is selected, click the **Deploy Branch** button.

### Debugging App Issues in Heroku

While in the dashboard for your specific App, there'll be a `Open App` button
and a `More` button.
- `Open App` does what it says.
- `More` gives you access to `View Logs` and `Run console`.
   - `View Logs` isn't that helpful. It seems to just give you the last X number
     of logs. So unless the important part of a stacktrace are in the last few
     lines, you may be SOL.
   - `Run console` allows you to connect to the current instance and run
     commands like you would in any SSH session.

---

## Testing

In order to ensure Cypress runs consistently on all OS's for CI and the GUI mode
I've opted for the Docker image. One downside to this is the size (over 2gb,
yeesh). I tried the non-Docker route, and the setup would be different for all
OS's and there was no guarantee it'd even work.

If you don't care about the GUI mode, just run `npm run test`.

To get the GUI to work, follow the instructions for your OS.

**Windows/WSL**
- Install `choco install vcxsrv`
- ~~Start a Server with these settings:~~
   ~~- **Display Settings**: `Multiple Windows`~~
   ~~- **Start Clients**: `Start no Clients`~~
   ~~- **Extra Settings**: Check `Disable Access Control`~~
- ~~Once the XServer is started, if you mouse over the icon, the hover tooltip will~~
  ~~tell you where the Server is listening for connections. Most likely something~~
  ~~like `<computer_nam>:0.0`.~~

**OSX**
- Install `brew install xquartz`
- Start XQuartz `open -a xquartz`.
   - Go to Preferences > Security.
      - Make sure `Allow connections from network clients` is checked
- Once the settings have been updated you can close XQuartz

**Once an XServer is set up on your OS**, run `npm run test:watch`
   
