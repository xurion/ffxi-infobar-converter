# FFXI Infobar Data Converter

This app will convert Infobar data from JSON to a structured Lua. Use this if
you have customised data you have applied to the SQLite database and wish to
migrate it to the new format using Lua.

## Setup

This app is built using Node & TypeScript and has a number of dependencies via
NPM. To install them, run:

```
npm install
```

If there is demand for it, I'll consider setting up a web app that will take a
JSON file and convert it instead of expecting people to set up this app locally.

## How To Use

You'll need to export your data from the SQLIte database to JSON. Most SQL
clients will offer this function, however, the shape of the exported JSON is
important. The structure of the JSON needs to be flat:

```
[
    {
        "drops": "Empress Hairpin, Insect Wing",
        "family": "Flies",
        "name": "Valkurm Emperor",
        "zone": "Valkurm Dunes",
        // more fields...
    },
    // more entries...
  }
]
```

Basically, each row in the monster table needs to be a separate entry. See
[example.json](example.json) as an example.

Once you have your JSON file, run:

```
npm run convert -- your-file.json
```

This will produce a file similarly named. For example, converting the above file
would create a collection of files in `output/your-file/`.

## Data Normalisation

A number of fields are normalised during the conversion. Some comma-separated
strings are converted to Lua tables (such as the drops field) and the shape of
some fields have been changed (such as the nested detects fields).

In order to keep the resulting field size as low as possible, boolean values are
instead represented as either `0` or `1`.

## Stripped fields

Some fields are removed during conversion. These are considered unused and just
add bloat. These fields include `allakhazam_id` and `atlas_id`.

## Converted Data Shape

The structure of the converted Lua is as follows:

```
{
  ['Valkurm Dunes'] = {
    ['Valkurm Emperor'] = {
      drops = {
        'Empress Hairpin',
        'Insect Wing',
      },
      family: "Fly",
      -- more fields...
    },
    -- more enemies...
  },
  -- more zones...
}
```

## Troubleshooting

If you're having issues getting the app to run, try using the provided example
by running:

```
npm run example
```

This uses the `example.json` file to create a collection of Lua files in
`output/example/`. If this works, there is probably something wrong with the
format of your JSON file. However, if this fails, the dependencies probably
haven't been installed (see above setup instructions).

If you're seeing anything unexpected, or you need help, please reach out via the
[issues](https://github.com/xurion/ffxi-infobar-converter/issues) section.
