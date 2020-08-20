# CAH-Box

Cards Against Humanity mixed with the play-on-any-device strategy of JackBox
games. Yuh know, cuz of COVID, and I wanted to play around with Svelte.

https://cahbox.herokuapp.com/

---

## Development

1. Install `npm i`
1. Run `npm run dev`

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
  
---

## Testing

In order to ensure Cypress runs consistently on all OS's for CI and the GUI mode
I've opted for the Docker image. One downside to this is the size (over 2gb,
yeesh). I tried the non-Docker route, and the setup would be different for all
OS's and there was no guarantee it'd even work.

If you don't care about the GUI mode, just run `npm run test`.

To get the GUI to work:
- [Download VcXsrv](https://sourceforge.net/projects/vcxsrv/files/latest/download), 
  it's available for OSX, Windows, and Linux.
- Install it and start a Server with these settings:
   - **Display Settings**: `Multiple Windows`
   - **Start Clients**: `Start no Clients`
   - **Extra Settings**: Check `Disable Access Control`
- Once the XServer is started, if you mouse over the icon, the hover tooltip will
  tell you where the Server is listening for connections. Most likely something
  like `<computer_nam>:0.0`.
- Run `npm run test:watch`
   
