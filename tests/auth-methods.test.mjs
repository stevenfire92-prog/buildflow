import assert from "node:assert/strict";
import { test } from "node:test";
import methods from "../api/auth/methods.js";
function res(){return {statusCode:200,headers:{},setHeader(k,v){this.headers[k]=v;return this;},status(n){this.statusCode=n;return this;},json(x){this.body=x;return this;}}}
test("passkey login and enrollment are disabled until cryptographic verification exists",()=>{const r=res();methods({method:"GET"},r);assert.equal(r.statusCode,200);assert.equal(r.body.passkey.enabled,false);assert.equal(r.body.passkey.loginEnabled,false);assert.equal(r.body.passkey.enrollmentEnabled,false);assert.equal(r.body.founder.productionVerified,false)});
test("sign-in methods API rejects mutation methods",()=>{const r=res();methods({method:"POST"},r);assert.equal(r.statusCode,405)});
