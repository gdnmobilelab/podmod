# Podmod

An "augmented" podcast player by the Guardian Mobile Innovation Lab. Delivers links and images to listeners at various marked points during playback.

<img src='readme-img.png' style='max-height: 500px; display:block;margin:auto'/>

## State of the project

This is a de-branded version of the code used in the [Strange Bird audio experiment](https://www.theguardian.com/strangebird). As a result of the experiment changing course a few times during development the code isn't very well organised, so I wouldn't recommend taking this wholesale as an audio player. However, you can use it successfully as a proof of concept to experiment with adding annotations to the podcast of your choice.

## Installing and running

This project requires you have Node installed on your system. To run it, clone this repo, then run:

    npm run install

In the repo directory. Once that has completed, run:

    npm run build-example-podcast

To create an example podcast in `bundles/example-podcast`. This script uses the macOS `say` command to generate an audio file from a script - if your platform doesn't have the say command installed you will need to find an alternative.

Now you should be able to run the project by running:

    npm run dev

then going to http://localhost:8080 in your browser.

---

The example podcast uses a few assets found online:

The robot avatar: Robot by iconsmind.com from the Noun Project

The 'beep' for new content: https://freesound.org/people/pan14/sounds/263133/

The photo of Manhattan: https://www.flickr.com/photos/henriquev/3365719283
