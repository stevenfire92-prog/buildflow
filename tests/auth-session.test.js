import test from 'node:test';
import assert from 'node:assert/strict';
import { readSession, publicSettingsError, loginPath } from '../src/lib/auth-session.js';

test('expired sessions become signed out without starting a redirect loop', async () => {
  for (const error of [{status:401}, {response:{status:403}}]) {
    const result = await readSession({auth:{me:async()=>{throw error;}}}, 'expired-test-token');
    assert.deepEqual(result, {user:null,error:null});
  }
});
test('a successful retry clears the prior error and returns the verified user', async () => {
  let fail = true;
  const client = {auth:{me:async()=>{if(fail)throw {status:503,message:'private server detail'};return {id:'user-a'};}}};
  assert.equal((await readSession(client,'test-token')).error.type,'service_unavailable');
  fail=false;
  assert.deepEqual(await readSession(client,'test-token'),{user:{id:'user-a'},error:null});
});
test('anonymous boot does not call protected user endpoint', async () => {
  assert.deepEqual(await readSession({auth:{me:()=>assert.fail('unexpected lookup')}},null),{user:null,error:null});
});
test('public settings auth failures accept both SDK error response formats',()=>{
  for (const error of [{status:403,data:{extra_data:{reason:'auth_required'}}},{response:{status:403,data:{extra_data:{reason:'auth_required'}}}}]) assert.equal(publicSettingsError(error).type,'auth_required');
});
test('unavailable public settings do not leak backend error details',()=>{
  const result=publicSettingsError({status:500,message:'private server detail'});
  assert.equal(result.type,'service_unavailable');assert.equal(JSON.stringify(result).includes('private'),false);
});
test('login redirect retains destination but removes bootstrap credentials',()=>{
  const result=loginPath({pathname:'/dashboard',search:'?tab=projects&access_token=private&app_id=wrong'});
  assert.equal(new URLSearchParams(result.split('?')[1]).get('returnTo'),'/dashboard?tab=projects');
});
test('auth pages do not recursively embed themselves in returnTo',()=>{
  assert.equal(loginPath({pathname:'/login',search:'?returnTo=/dashboard'}),'/login');
});
