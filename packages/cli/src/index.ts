#!/usr/bin/env node
import { sharedUtil } from "@vouch/shared";

const run = () => {
  console.log("vouch CLI initialized");
  console.log(sharedUtil());
};

run();
