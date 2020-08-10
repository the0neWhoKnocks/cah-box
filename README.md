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
