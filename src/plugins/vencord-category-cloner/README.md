> # ⚠️ Installing anything from here is not officially supported.
> If you don't understand these instructions, installing unofficial plugins is not for you.
> Do not ask for help in <#1026515880080842772>.
> Instead, ask for help in the thread of the plugin(s) you're using.

## First Time Setup
Vencord is not modular, so you have to build from source to add custom plugins.
Follow this guide for getting set up: https://docs.vencord.dev/installing/custom-plugins/

## How to install a plugin
1. Direct your terminal to the `userplugins` folder, e.g. `cd src/userplugins`. If you're confused, read the guide above
2. Inside your terminal, run
```sh
git clone https://github.com/mafineeek/vencord-category-cloner vencordCategoryCloner
```

## How to update plugins
You will have to make sure to keep up with the latest changes to fix issues and get new features. You can update a plugin by directing your terminal to its folder (`cd src/userplugins/vencordCategoryCloner`) and running:
```sh
git pull
```
