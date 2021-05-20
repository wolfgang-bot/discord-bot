# Modules

- [Modules](#modules)
  - [General](#general)
  - [Create a module](#create-a-module)
  - [Folder structure](#folder-structure)

## General

Modules are the building blocks of the discord bot and only they communicate with the discord API.

**Starting**
If not deactivated, a module can be started through the web-interface. The configuration object will then be instantiated automatically and passed to the module's instance.

**Bot Restart**
After a restart of the bot all instances will restarted automatically, but a module does not know whether it got started by a user or a restart.

**Translations**
A module's translation keys (to be used by the ``LocaleProvider`` class) must be placed inside the ``locales/`` directory, where the filenames follow the schema ``<locale-code>.yml``. The locale-code ``en`` must be given, others are optional and missing translations will fallback to the ``en`` locale.

> Locale files are written in the yaml format. They must contain a flat hirarchy, so only one-dimensional keys are allowed.

**Meta Data**
To assign meta-data like the commands used or arguments required, decorators from ``lib/decorators`` can be used. The most common ones are ``@module(...)`` which declares a module, ``@argument(...)`` which adds an argument and ``@command(...)`` which adds a command to the module.

## Create a module

1. ``npm run create-module <module-key>``
2. Rename the class in the index.js file
3. Replace the icon.svg file

## Folder structure

The folder structure is not mandatory but recommended.

```
|-- commands
|-- embeds
|-- locales
|   |-- en.yml
|-- managers
|-- models
|   |-- Configuration.ts
|-- icon.svg
|-- index.js
```
