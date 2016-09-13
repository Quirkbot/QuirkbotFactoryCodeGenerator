# Quirkbot Factory Code Generator

This script generates unique compiled firmwares (each one with an unique UUID)
to be used as the "factory program" to Quirkbots on production.

## Setup
```
npm install
```

## Usage
```
npm start [output directory]
```
This will output an .hex file to the specified `[output directory]`. By default,
that will be directory named `uuid` on the same location the script is run from.

In order to generate a batch of firmwares, simply use a bash for loop:
```
for i in {1..100}; do echo $i && npm start; done;
```
