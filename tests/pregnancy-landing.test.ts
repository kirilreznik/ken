import { describe, it, expect, vi, afterEach } from 'vitest';
import landing from '../src/lib/pregnancy-landing.mjs';
const origin = 'https://ken.example';
const env = {OPERATOR_NAME:'Test operator',CONTACT_EMAIL:'test@example.com',WAITLIST_WEBHOOK_URL:'https://list.example/subscribe'};
function request(body: object, source = origin) {
  return new Request(origin+'/api/pregnancy-waitlist', {method:'POST',headers:{origin:source,'Content-Type':'application/json'},body:JSON.stringify(body)});
}
afterEach(()=>vi.unstubAllGlobals());
describe('public pregnancy landing page',()=>{
  it('renders Hebrew without app auth or collection when unconfigured',async()=>{
    const res = await landing.fetch(new Request(origin+'/pregnancy'),{});
    expect(res.status).toBe(200);
    const html = await res.text();
    expect(html).toContain('lang="he" dir="rtl"');
    expect(html).toContain('לא אוסף כתובות אימייל');
    expect(html).toContain("fetch('/api/pregnancy-waitlist'");
    expect(html).not.toContain('supabase');
    expect(res.headers.get('Cache-Control')).toBe('no-store');
    expect((await landing.fetch(request({email:'test@example.com',consent:true}),{})).status).toBe(503);
  });
  it('rejects unconsented, medical, and cross-origin submissions',async()=>{
    for(const body of [{email:'a@b.com'},{email:'a@b.com',consent:true,week:24},{email:'a@b.com',consent:true,website:'spam'}]) {
      expect((await landing.fetch(request(body),env)).status).toBe(400);
    }
    expect((await landing.fetch(request({email:'a@b.com',consent:true},'https://other.example'),env)).status).toBe(403);
  });
  it('forwards only the subscription fields and reports upstream errors',async()=>{
    const upstream=vi.fn().mockResolvedValue(new Response('{}',{status:200}));
    vi.stubGlobal('fetch',upstream);
    expect((await landing.fetch(request({email:'A@B.com',consent:true}),env)).status).toBe(200);
    const payload=JSON.parse(upstream.mock.calls[0][1].body);
    expect(Object.keys(payload).sort()).toEqual(['email','consent','consent_text','consent_version','created_at'].sort());
    expect(payload.email).toBe('a@b.com');
    expect(payload.consent).toBe(true);
    upstream.mockResolvedValue(new Response('{}',{status:500}));
    expect((await landing.fetch(request({email:'a@b.com',consent:true}),env)).status).toBe(502);
  });
});
