import test from 'node:test';
import assert from 'node:assert/strict';
import config from '../api/config.js';
import webhook from '../api/webhook.js';
import workspace from '../api/workspace.js';
import billing from '../api/billing.js';
function response(){return {headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},json(body){this.body=body;}};}
test('public configuration exposes no secret values and closes billing by default',()=>{const res=response();config({method:'GET'},res);assert.equal(res.code,200);assert.equal(res.body.billingReady,false);assert.equal(JSON.stringify(res.body).includes('STRIPE_SECRET_KEY'),false);});
test('unconfigured webhook returns a genuine failure rather than fake HTTP 200',async()=>{const res=response();await webhook({method:'POST',headers:{}},res);assert.equal(res.code,503);});
test('workspace rejects access without authentication and storage',async()=>{const res=response();await workspace({method:'GET',headers:{}},res);assert.equal(res.code,503);assert.equal(res.body.quotes,undefined);});
test('billing rejects requests without approved origin before external requests',async()=>{const res=response();await billing({method:'POST',headers:{origin:'https://attacker.example'},body:{action:'checkout',price:'client-selected'}},res);assert.equal(res.code,403);assert.equal(res.body.url,undefined);});
